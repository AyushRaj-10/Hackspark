import pandas as pd
df = pd.read_csv(r"C:\Hackspark\archive\routes.csv")
df.columns = df.columns.str.strip()   # Remove leading/trailing spaces
if "id" in df.columns:
    df = df.rename(columns={"id": "route_id"})
else:
    raise ValueError("The CSV does not contain an 'id' column to rename.")

 
if "direction_id" in df.columns:
    df = df.sort_values(by=["route_id", "direction_id"])
else:
    df = df.sort_values(by=["route_id"])   # If direction column not present
 
df = df.reset_index(drop=True)

 
output_path = "routes_clean.csv"
df.to_csv(output_path, index=False)

 
print("\nCleaned & Sorted Data:")
print(df.head())

print(f"\nSaved cleaned file to: {output_path}")
