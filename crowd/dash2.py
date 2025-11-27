import streamlit as st
import pandas as pd
import altair as alt

st.set_page_config(page_title="Bus Crowd Forecast", layout="wide")

# ------------------------------------
# Load & compute internals (hidden from user)
# ------------------------------------
@st.cache_data
def load_and_compute():
    # Use the multi-route dataset
    df = pd.read_csv("all_routes_boarding.csv")

    # Clean any fully empty rows (just in case)
    df = df.dropna(how="all")

    # Ensure integer types
    df["stop_sequence"] = df["stop_sequence"].astype(int)
    df["boarded"] = df["boarded"].astype(int)
    df["deboarded"] = df["deboarded"].astype(int)
    df["capacity"] = df["capacity"].astype(int)

    # Sort properly
    df = df.sort_values(by=["route_id", "bus_id", "stop_sequence"]).reset_index(drop=True)

    # Internal calculation – NOT SHOWN directly
    df["net_change"] = df["boarded"] - df["deboarded"]
    df["current_passengers"] = df.groupby(["route_id", "bus_id"])["net_change"].cumsum()
    df["current_passengers"] = df["current_passengers"].clip(lower=0)
    df["crowd_percent"] = df["current_passengers"] / df["capacity"] * 100

    def label_crowd(p):
        if p < 40:
            return "LOW"
        elif p < 70:
            return "MEDIUM"
        else:
            return "HIGH"

    df["crowd_level"] = df["crowd_percent"].apply(label_crowd)

    # We keep boarded/deboarded only internally; frontend will NOT show them
    return df

df = load_and_compute()

# ------------------------------------
# UI – Filters
# ------------------------------------
st.title("🚌 Bus Crowd Forecast (Upcoming Stops)")
st.markdown("Select a route, bus, and current stop to see **future crowd levels** on upcoming stops.")

st.sidebar.header("🔍 Select Current Journey")

routes = df["route_id"].unique()
route_selected = st.sidebar.selectbox("Route", routes)

df_route = df[df["route_id"] == route_selected]

buses = df_route["bus_id"].unique()
bus_selected = st.sidebar.selectbox("Bus", buses)

df_bus = df_route[df_route["bus_id"] == bus_selected].sort_values("stop_sequence")

# list of stops in order
stop_names = df_bus["stop_name"].tolist()
current_stop = st.sidebar.selectbox("Current Stop (where the bus is now)", stop_names)

# Find current stop row
current_row = df_bus[df_bus["stop_name"] == current_stop].iloc[0]
current_seq = current_row["stop_sequence"]

# ------------------------------------
# Current stop crowd card
# ------------------------------------
st.subheader(f"📍 Current Stop: **{current_stop}** — Route {route_selected}, Bus {bus_selected}")

crowd_level_now = current_row["crowd_level"]
crowd_percent_now = current_row["crowd_percent"]
passengers_now = current_row["current_passengers"]
capacity = current_row["capacity"]

color_map = {
    "LOW": "#4CAF50",       # Green
    "MEDIUM": "#FFC107",    # Yellow
    "HIGH": "#F44336"       # Red
}
level_color = color_map.get(crowd_level_now, "#9E9E9E")

st.markdown(
    f"""
    <div style="background-color:{level_color};padding:20px;border-radius:10px;color:white;
                font-size:22px;text-align:center;margin-bottom:10px;">
        <b>NOW: {crowd_level_now} CROWD</b><br>
        {crowd_percent_now:.1f}% full ({passengers_now}/{capacity} passengers)
    </div>
    """,
    unsafe_allow_html=True
)

# ------------------------------------
# Upcoming stops forecast (future)
# ------------------------------------
st.subheader("🔮 Upcoming Stops – Expected Crowd")

# upcoming stops: sequence > current_seq
df_future = df_bus[df_bus["stop_sequence"] > current_seq].copy()

if df_future.empty:
    st.info("No upcoming stops – this bus is at or near the final stop on this route.")
else:
    df_future_display = df_future[[
        "stop_sequence",
        "stop_name",
        "current_passengers",
        "crowd_percent",
        "crowd_level"
    ]].rename(columns={
        "stop_sequence": "Stop #",
        "stop_name": "Upcoming Stop",
        "current_passengers": "Expected Passengers",
        "crowd_percent": "Expected Crowd (%)",
        "crowd_level": "Crowd Level"
    })

    # Show compact table without boarded/deboarded
    st.table(df_future_display.style.format({
        "Expected Crowd (%)": "{:.1f}"
    }))

    # ------------------------------------
    # Chart – only upcoming stops
    # ------------------------------------
    st.subheader("📈 Crowd Trend for Upcoming Stops")

    chart = alt.Chart(df_future).mark_line(point=True).encode(
        x=alt.X("stop_sequence:O", title="Stop Sequence (upcoming only)"),
        y=alt.Y("crowd_percent:Q", title="Expected Crowd (%)"),
        tooltip=["stop_name", "current_passengers", "crowd_percent", "crowd_level"],
        color=alt.value("#1976D2")
    ).properties(
        width=800,
        height=400
    )

    st.altair_chart(chart, use_container_width=True)