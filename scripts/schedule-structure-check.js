#!/usr/bin/env node

/**
 * Schedule Directory Structure Check
 * 
 * This script sets up a scheduled job to check directory structure
 * and ensure files are properly organized.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants
const CRON_JOB_NAME = 'ride-with-vic-directory-check';
const CRON_SCHEDULE = '0 9 * * 1-5'; // 9 AM Monday-Friday
const SCRIPT_PATH = path.join(__dirname, 'enforce-structure.js');
const LOG_PATH = path.join(os.homedir(), '.ride-with-vic-structure-check.log');

/**
 * Add a cron job to the system's crontab
 * @param {string} schedule - Cron schedule expression
 * @param {string} command - Command to execute
 * @param {string} jobName - Name of the job for identification
 */
function addCronJob(schedule, command, jobName) {
  if (os.platform() === 'win32') {
    console.error('Windows scheduling not supported. Please use Task Scheduler manually.');
    console.log(`To set up a Windows task, run:`);
    console.log(`schtasks /create /tn "${jobName}" /tr "${command}" /sc DAILY /st 09:00`);
    return;
  }

  // Get existing crontab
  const crontab = spawn('crontab', ['-l']);
  let crontabContent = '';
  let newJob = true;

  crontab.stdout.on('data', (data) => {
    crontabContent += data.toString();
  });

  crontab.stderr.on('data', (data) => {
    // If no crontab exists yet, that's fine
    if (!data.toString().includes('no crontab')) {
      console.error(`Error reading crontab: ${data}`);
    }
  });

  crontab.on('close', (code) => {
    // Split content into lines
    const lines = crontabContent.split('\n');
    const updatedLines = [];

    // Check if job already exists
    for (const line of lines) {
      if (line.includes(`# ${jobName}`)) {
        // Replace existing job
        updatedLines.push(`${schedule} ${command} >> ${LOG_PATH} 2>&1 # ${jobName}`);
        newJob = false;
      } else if (line.trim()) {
        updatedLines.push(line);
      }
    }

    // Add new job if it doesn't exist
    if (newJob) {
      updatedLines.push(`${schedule} ${command} >> ${LOG_PATH} 2>&1 # ${jobName}`);
    }

    // Write updated crontab
    const updatedContent = updatedLines.join('\n') + '\n';
    fs.writeFileSync('new-crontab.txt', updatedContent);

    const updateCrontab = spawn('crontab', ['new-crontab.txt']);
    
    updateCrontab.stderr.on('data', (data) => {
      console.error(`Error updating crontab: ${data}`);
    });

    updateCrontab.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Cron job ${newJob ? 'added' : 'updated'} successfully.`);
        console.log(`Schedule: ${schedule}`);
        console.log(`Command: ${command}`);
        console.log(`Log file: ${LOG_PATH}`);
      } else {
        console.error(`❌ Failed to update crontab. Exit code: ${code}`);
      }

      // Clean up temporary file
      fs.unlinkSync('new-crontab.txt');
    });
  });
}

/**
 * Add a scheduled task on Windows
 * @param {string} taskName - Name of the task
 * @param {string} command - Command to execute
 */
function addWindowsTask(taskName, command) {
  const schtasks = spawn('schtasks', [
    '/create', 
    '/tn', 
    taskName, 
    '/tr', 
    command, 
    '/sc', 
    'DAILY', 
    '/st', 
    '09:00'
  ]);

  schtasks.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  schtasks.stderr.on('data', (data) => {
    console.error(`Error creating scheduled task: ${data}`);
  });

  schtasks.on('close', (code) => {
    if (code === 0) {
      console.log(`✅ Scheduled task created successfully.`);
    } else {
      console.error(`❌ Failed to create scheduled task. Exit code: ${code}`);
    }
  });
}

/**
 * Add a launchd job on macOS
 * @param {string} jobName - Name of the job
 * @param {string} command - Command to execute
 */
function addLaunchdJob(jobName, command) {
  const plistPath = path.join(os.homedir(), 'Library/LaunchAgents', `${jobName}.plist`);
  
  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${jobName}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>${command} >> ${LOG_PATH} 2>&1</string>
  </array>
  <key>StartCalendarInterval</key>
  <array>
    <dict>
      <key>Hour</key>
      <integer>9</integer>
      <key>Minute</key>
      <integer>0</integer>
      <key>Weekday</key>
      <integer>1</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>9</integer>
      <key>Minute</key>
      <integer>0</integer>
      <key>Weekday</key>
      <integer>2</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>9</integer>
      <key>Minute</key>
      <integer>0</integer>
      <key>Weekday</key>
      <integer>3</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>9</integer>
      <key>Minute</key>
      <integer>0</integer>
      <key>Weekday</key>
      <integer>4</integer>
    </dict>
    <dict>
      <key>Hour</key>
      <integer>9</integer>
      <key>Minute</key>
      <integer>0</integer>
      <key>Weekday</key>
      <integer>5</integer>
    </dict>
  </array>
  <key>RunAtLoad</key>
  <false/>
  <key>StandardErrorPath</key>
  <string>${LOG_PATH}</string>
  <key>StandardOutPath</key>
  <string>${LOG_PATH}</string>
</dict>
</plist>`;

  try {
    fs.writeFileSync(plistPath, plistContent);
    console.log(`✅ Created launchd plist at ${plistPath}`);
    
    // Load the job
    const launchctl = spawn('launchctl', ['load', plistPath]);
    
    launchctl.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    launchctl.stderr.on('data', (data) => {
      console.error(`Error loading launchd job: ${data}`);
    });
    
    launchctl.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Launchd job loaded successfully.`);
        console.log(`Command: ${command}`);
        console.log(`Log file: ${LOG_PATH}`);
      } else {
        console.error(`❌ Failed to load launchd job. Exit code: ${code}`);
      }
    });
  } catch (error) {
    console.error(`❌ Failed to create launchd plist: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  console.log('=== Setting up directory structure check schedule ===');
  
  const nodeCommand = process.execPath; // Path to the Node.js executable
  const command = `${nodeCommand} ${SCRIPT_PATH} --report-only`;
  
  // Use different scheduling based on platform
  const platform = os.platform();
  
  if (platform === 'darwin') {
    // macOS - use launchd
    addLaunchdJob(CRON_JOB_NAME, command);
  } else if (platform === 'win32') {
    // Windows - use Task Scheduler
    addWindowsTask(CRON_JOB_NAME, command);
  } else {
    // Linux/Unix - use crontab
    addCronJob(CRON_SCHEDULE, command, CRON_JOB_NAME);
  }
}

// Run when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 