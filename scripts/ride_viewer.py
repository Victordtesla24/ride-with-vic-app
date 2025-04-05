import tkinter as tk
from tkinter import ttk
import csv
import os

class RideViewer:
    def __init__(self, master):
        self.master = master
        master.title("Ride History Viewer")
        master.geometry("800x400")
        
        # Create treeview for displaying rides
        self.tree_frame = tk.Frame(master)
        self.tree_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Create scrollbar
        self.scrollbar = ttk.Scrollbar(self.tree_frame)
        self.scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Create treeview
        self.tree = ttk.Treeview(self.tree_frame, yscrollcommand=self.scrollbar.set)
        self.scrollbar.config(command=self.tree.yview)
        
        # Define columns
        self.tree["columns"] = ("Date", "Time", "Pickup", "Dropoff", "Fare", "Driver", "Rating", "Payment", "Notes")
        self.tree.column("#0", width=0, stretch=tk.NO)  # Hidden ID column
        
        # Set column widths
        for col in self.tree["columns"]:
            width = 150 if col in ["Pickup", "Dropoff", "Notes"] else 80
            self.tree.column(col, anchor=tk.W, width=width)
            self.tree.heading(col, text=col, anchor=tk.W)
        
        # Pack the treeview
        self.tree.pack(fill=tk.BOTH, expand=True)
        
        # Button to refresh data
        self.refresh_btn = tk.Button(master, text="Refresh Data", command=self.load_data)
        self.refresh_btn.pack(pady=10)
        
        # Load initial data
        self.load_data()
    
    def load_data(self):
        # Clear existing data
        for i in self.tree.get_children():
            self.tree.delete(i)
            
        # Check if file exists
        if not os.path.isfile("rides.csv"):
            return
            
        # Load data from CSV
        try:
            with open("rides.csv", "r", newline="") as file:
                reader = csv.DictReader(file)
                for i, row in enumerate(reader):
                    values = (
                        row.get("Date", ""),
                        row.get("Time", ""),
                        row.get("Pickup Location", ""),
                        row.get("Drop-off Location", ""),
                        row.get("Fare", ""),
                        row.get("Driver", ""),
                        row.get("Rating", ""),
                        row.get("Payment Method", ""),
                        row.get("Notes", "")
                    )
                    self.tree.insert("", tk.END, iid=str(i), values=values)
        except Exception as e:
            print(f"Error loading data: {e}")

if __name__ == "__main__":
    root = tk.Tk()
    app = RideViewer(root)
    root.mainloop() 