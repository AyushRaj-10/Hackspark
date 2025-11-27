import os
import pandas as pd
import numpy as np
import streamlit as st
import time

st.set_page_config(page_title="Smart Bus Tracking Dashboard", layout="wide")

# 🔹 Check if required preprocessing files exist
required_files = ["route_delay_summary.csv", "route_track_points.csv"]
missing_files = [f for f in required_files if not os.path.exists(f)]

if missing_files:
    st.warning("⚠ Required files missing. Generating them now...")

    # Load original CSVs
    routes = pd.read_csv("routes.csv")
    routes_coordinates = pd.read_csv("routes_with_coordinates.csv")
    stop_times = pd.read_csv("stop_times.csv")
    stops = pd.read_csv("stops.csv")
    trips = pd.read_csv("trips.csv")

    # Merge data
    trips_routes = pd.merge(trips, routes, on="route_id", how="left")
    trip_data = pd.merge(stop_times, trips_routes, on="trip_id", how="left")
    complete_data = pd.merge(trip_data, stops, on="stop_id", how="left")

    # Simulate delay (random since no real-time data)
    if 'arrival_time' in complete_data.columns:
        complete_data["scheduled_arrival_time"] = pd.to_datetime(complete_data["arrival_time"], errors='coerce')
        complete_data["actual_arrival_time"] = complete_data["scheduled_arrival_time"] + pd.to_timedelta(
            np.random.randint(1, 15, complete_data.shape[0]), unit='m'
        )
        complete_data["delay_minutes"] = (
            complete_data["actual_arrival_time"] - complete_data["scheduled_arrival_time"]
        ).dt.total_seconds() / 60
    else:
        complete_data["delay_minutes"] = np.random.randint(1, 15, complete_data.shape[0])

    # Export required files
    complete_data.groupby("route_id")["delay_minutes"].mean().reset_index().to_csv("route_delay_summary.csv", index=False)
    sample_route = complete_data["route_id"].iloc[0]
    complete_data[complete_data["route_id"] == sample_route][["stop_id", "stop_name", "stop_lat", "stop_lon"]].drop_duplicates().to_csv("route_track_points.csv", index=False)

    st.success("✅ Missing files generated successfully! Please re-run the app.")
    st.stop()  # Stop execution and ask user to re-run

# ➡ Continue normally once files exist
route_delay_summary = pd.read_csv("route_delay_summary.csv")
track_points = pd.read_csv("route_track_points.csv")

# Load essential CSVs
routes = pd.read_csv("routes.csv")
routes_coordinates = pd.read_csv("routes_with_coordinates.csv")
stop_times = pd.read_csv("stop_times.csv")
stops = pd.read_csv("stops.csv")
trips = pd.read_csv("trips.csv")
route_delay_summary = pd.read_csv("route_delay_summary.csv")
track_points = pd.read_csv("route_track_points.csv")

# =========================================
# Generate delay analysis dynamically
# =========================================
if 'delay_minutes' not in route_delay_summary.columns:
    st.warning("⚠ No delay data found. Generating random delay values...")
    route_delay_summary['delay_minutes'] = np.random.randint(1, 15, route_delay_summary.shape[0])

# Simulate delay trend (hour-wise)
delay_hours = pd.DataFrame({
    'hour': range(6, 23),
    'delay_minutes': np.random.randint(1, 20, size=17)
})

# Safely generate most delayed stops
num_stops = min(5, len(track_points))
delayed_stops = pd.DataFrame({
    'stop_name': track_points['stop_name'].head(num_stops).values,
    'delay_minutes': np.random.randint(3, 15, num_stops)
})

# =========================================
# Sidebar: Route Selection
# =========================================
selected_route = st.sidebar.selectbox(
    "🔍 Select Route",
    route_delay_summary['route_id'].unique()
)

selected_delay = route_delay_summary[route_delay_summary['route_id'] == selected_route]['delay_minutes'].values[0]
st.write(f"### 📌 Route Selected: `{selected_route}`")

# Display delay alert
if selected_delay > 5:
    st.error(f"⚠ High Delay: **{selected_delay:.2f} min** (avg). Suggest alternatives.")
else:
    st.success(f"🟢 Low Delay: **{selected_delay:.2f} min**. Safe to travel.")

# =========================================
# 🚍 Live Bus Route Animation (Advanced)
# =========================================
st.write("### 🗺 Real-Time Bus Movement Simulation")

# Predefined smooth GPS route (Bangalore locations)
simulated_route = [
    {"lat": 12.9716, "lon": 77.5946},  # MG Road
    {"lat": 12.9750, "lon": 77.6000},
    {"lat": 12.9790, "lon": 77.6050},
    {"lat": 12.9820, "lon": 77.6100},
    {"lat": 12.9850, "lon": 77.6150},  # Cubbon Park
    {"lat": 12.9880, "lon": 77.6190},
    {"lat": 12.9910, "lon": 77.6220},
    {"lat": 12.9940, "lon": 77.6250},  # Majestic
]

# Map placeholder for animation
map_placeholder = st.empty()
eta_placeholder = st.empty()

col1, col2 = st.columns(2)
start_button = col1.button("▶ Start Live Tracking")
stop_button = col2.button("⛔ Stop")

if start_button:
    st.write("🚍 Bus is moving... Live tracking enabled.")
    for _ in range(2):  # Loop twice (forward + backward)
        for point in simulated_route + list(reversed(simulated_route)):
            if stop_button:
                st.warning("⛔ Tracking stopped.")
                break

            df = pd.DataFrame([point])
            map_placeholder.map(df)

            # Simulated ETA logic
            eta_time = np.random.randint(3, 15)
            eta_placeholder.write(f"🕒 Estimated Time to Destination: **{eta_time} mins**")

            time.sleep(2)  # Speed control

    st.success("✔ Route simulation completed.")

else:
    st.write("⏸ Bus is currently stationary.")
    map_placeholder.map(pd.DataFrame([simulated_route[0]]))
    eta_placeholder.write("🕒 ETA: Waiting for route start...")

# =========================================
# Display Most Delayed Stops
# =========================================
st.write("### 🚫 Most Delayed Stops (Simulated)")
st.table(delayed_stops)

# =========================================
# Show Delay Trend
# =========================================
st.write("### 📈 Delay Trend by Hour (Simulated)")
st.line_chart(delay_hours.set_index('hour'))

# =========================================
# Alternative Suggestions
# =========================================
st.write("### 🚕 Suggested Transport Alternatives")
if selected_delay > 6:
    st.info("""
🚨 High delay detected! Recommended:
- 🚖 Uber (Fastest, but costly)
- 🛵 Rapido (Cheapest, but may vary)
- 🚇 Metro (Best for reliability & eco-friendly)
""")
else:
    st.success("🟢 No need for alternate options. Route is stable.")

st.write("🔥 Dashboard built using BMTC dataset + simulated real-time bus tracking.")