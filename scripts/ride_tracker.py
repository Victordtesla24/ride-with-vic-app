import tkinter as tk
from tkinter import messagebox
import csv
import os

class RideTracker:
    def __init__(self, master):
        self.master = master
        master.title("Ride Tracker")
        master.geometry("400x400")
        master.resizable(False, False)

        # Define ride details fields
        self.fields = {
            "Date": tk.StringVar(),
            "Time": tk.StringVar(),
            "Pickup Location": tk.StringVar(),
            "Drop-off Location": tk.StringVar(),
            "Fare": tk.StringVar(),
            "Driver": tk.StringVar(),
            "Rating": tk.StringVar(),
            "Payment Method": tk.StringVar(),
            "Notes": tk.StringVar(),
        }
        
        # Create labels and entry widgets for each field
        row = 0
        for field, var in self.fields.items():
            tk.Label(master, text=field, font=("Arial", 10, "bold")).grid(row=row, column=0, padx=10, pady=5, sticky=tk.W)
            tk.Entry(master, textvariable=var, width=30).grid(row=row, column=1, padx=10, pady=5)
            row += 1
        
        # Add buttons
        button_frame = tk.Frame(master)
        button_frame.grid(row=row, column=0, columnspan=2, pady=15)
        
        tk.Button(button_frame, text="Save Ride", command=self.save_ride, 
                 bg="#4CAF50", fg="white", width=12, height=2).pack(side=tk.LEFT, padx=10)
        
        tk.Button(button_frame, text="Clear Fields", command=self.clear_fields,
                 bg="#f44336", fg="white", width=12, height=2).pack(side=tk.LEFT, padx=10)
    
    def save_ride(self):
        # Validate required fields
        if not self.fields["Date"].get() or not self.fields["Pickup Location"].get() or not self.fields["Drop-off Location"].get():
            messagebox.showerror("Error", "Date, Pickup Location, and Drop-off Location are required!")
            return
            
        filename = "rides.csv"
        file_exists = os.path.isfile(filename)
        
        with open(filename, mode='a', newline='') as file:
            writer = csv.writer(file)
            # Write header if file is new
            if not file_exists:
                writer.writerow(list(self.fields.keys()))
            writer.writerow([var.get() for var in self.fields.values()])
        
        messagebox.showinfo("Success", "Ride details saved successfully!")
        self.clear_fields()
    
    def clear_fields(self):
        # Clear all entry fields
        for var in self.fields.values():
            var.set("")

if __name__ == "__main__":
    root = tk.Tk()
    app = RideTracker(root)
    root.mainloop() 