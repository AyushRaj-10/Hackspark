import pandas as pd
import numpy as np

# ==========================
# STEP 0: Load All CSV Files
# ==========================
routes = pd.read_csv("routes.csv")
routes_coordinates = pd.read_csv("routes_with_coordinates.csv")
stop_times = pd.read_csv("stop_times.csv")
stops = pd.read_csv("stops.csv")
trips = pd.read_csv("trips.csv")

print("\n📂 Data Loaded Successfully!")
print("🚌 Routes:", routes.head())
print("🗺 Routes with Coordinates:", routes_coordinates.head())
print("⏱ Stop Times:", stop_times.head())
print("📍 Stops:", stops.head())
print("🧾 Trips:", trips.head())

# =========================================
# STEP 1: Merge trips with routes
# =========================================
trips_routes = pd.merge(trips, routes, on="route_id", how="left")

# =========================================
# STEP 2: Merge stop_times with trip info
# =========================================
trip_data = pd.merge(stop_times, trips_routes, on="trip_id", how="left")

# =========================================
# STEP 3: Add stop coordinates
# =========================================
complete_data = pd.merge(trip_data, stops, on="stop_id", how="left")

print("\n🔍 FINAL MERGED DATA (raw):")
print(complete_data.head())

# =========================================
# STEP 4: Calculate Delay
# =========================================
if 'scheduled_arrival_time' in complete_data.columns and 'actual_arrival_time' in complete_data.columns:
    complete_data['scheduled_arrival_time'] = pd.to_datetime(complete_data['scheduled_arrival_time'])
    complete_data['actual_arrival_time'] = pd.to_datetime(complete_data['actual_arrival_time'])
    
    complete_data['delay_minutes'] = (
        complete_data['actual_arrival_time'] - complete_data['scheduled_arrival_time']
    ).dt.total_seconds() / 60
    
    print("\n🕒 Sample Delay Records:")
    print(complete_data[['route_id', 'stop_id', 'scheduled_arrival_time', 'actual_arrival_time', 'delay_minutes']].head())
else:
    print("⚠️ No actual arrival data found. Generating mock delay...")
    complete_data['delay_minutes'] = np.random.randint(1, 15, complete_data.shape[0])

# =========================================
# STEP 5: Extract route delay performance
# =========================================
route_delay_summary = complete_data.groupby('route_id')['delay_minutes'].mean().reset_index()
route_delay_summary = route_delay_summary.sort_values('delay_minutes', ascending=False)

print("\n🚍 AVERAGE DELAY PER ROUTE:")
print(route_delay_summary.head())

# =========================================
# STEP 6: Most delayed stops
# =========================================
delayed_stops = complete_data.groupby('stop_name')['delay_minutes'].mean().reset_index()
delayed_stops = delayed_stops.sort_values('delay_minutes', ascending=False).head(5)

print("\n🚫 Most Delayed Stops:")
print(delayed_stops)

# =========================================
# STEP 7: Delay by time of day (hourly trends)
# =========================================
complete_data['hour'] = complete_data['scheduled_arrival_time'].dt.hour
delay_by_hour = complete_data.groupby('hour')['delay_minutes'].mean().reset_index()

print("\n⏰ Delay by Time of Day:")
print(delay_by_hour)

# =========================================
# STEP 8: Delay alert logic
# =========================================
def check_route_delay(route_id, threshold=5):
    avg_delay = route_delay_summary[route_delay_summary['route_id'] == route_id]['delay_minutes'].values[0]
    if avg_delay > threshold:
        return f"🚨 Route {route_id} is usually delayed by {avg_delay:.2f} mins. Suggest Faster Alternate (Uber/Metro/Rapido)"
    else:
        return f"🟢 Route {route_id} is usually reliable ({avg_delay:.2f} mins delay)."

sample_route_id = complete_data['route_id'].iloc[0]
print("\n🔔 Delay Alert Message:")
print(check_route_delay(sample_route_id))

# =========================================
# STEP 9: Simulated Bus Tracking
# =========================================
sample_route_data = complete_data[complete_data['route_id'] == sample_route_id]
track_points = sample_route_data[['stop_id', 'stop_name', 'stop_lat', 'stop_lon']].drop_duplicates()

print("\n🗺️ Simulated Bus Tracking Points (use in frontend map):")
print(track_points.head())

# =========================================
# EXTRA STEP: Save important results for backend API or frontend use
# =========================================
route_delay_summary.to_csv("route_delay_summary.csv", index=False)
track_points.to_csv("route_track_points.csv", index=False)
delay_by_hour.to_csv("delay_by_hour.csv", index=False)
delayed_stops.to_csv("most_delayed_stops.csv", index=False)

print("\n💾 Export completed: route_delay_summary.csv, route_track_points.csv, delay_by_hour.csv")
