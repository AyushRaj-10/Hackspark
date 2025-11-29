 # backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import requests

BMTC_BASE_URL = "https://bmtcmobileapi.karnataka.gov.in/WebAPI"

app = FastAPI(title="BMTC Live Tracker Backend")

# CORS so your frontend (localhost:5500 etc.) can call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BusLocation(BaseModel):
    lat: float
    lng: float
    heading: float | None = None
    nextStop: str | None = None
    previousStop: str | None = None
    lastUpdated: str | None = None
    routeId: int | None = None
    routeNo: str | None = None
    vehicleId: int
    vehicleNo: str | None = None
    tripStatus: str | None = None
    eta: str | None = None


class Stop(BaseModel):
    name: str
    lat: float
    lng: float
    sequence: int


class StopsResponse(BaseModel):
    routeId: int
    routeNo: str
    direction: str | None = None
    stops: List[Stop]


def make_bmtc_headers() -> dict:
    """
    Spoof headers similar to the Namma BMTC Android app / web app.
    Adjust if you capture more accurate headers.
    """
    return {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en-IN;q=0.9",
        "Connection": "keep-alive",
        "Host": "bmtcmobileapi.karnataka.gov.in",
        "Origin": "https://nammabmtcapp.karnataka.gov.in",
        "Referer": "https://nammabmtcapp.karnataka.gov.in/",
        "User-Agent": (
            "Mozilla/5.0 (Linux; Android 13; SM-M326B) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/112.0.0.0 Mobile Safari/537.36"
        ),
        # Some APIs also check this (Android app package name-style header)
        "X-Requested-With": "com.kar.bmtc",
    }


@app.get("/api/bus/{vehicle_id}", response_model=BusLocation)
def get_bus_location(vehicle_id: int):
    """
    Get live location for a single BMTC vehicle by ID.
    Proxies BMTC VehicleTripDetails_v2.
    """
    url = f"{BMTC_BASE_URL}/VehicleTripDetails_v2"
    payload = {"vehicleId": vehicle_id}
    headers = make_bmtc_headers()

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=8)
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error contacting BMTC API: {e}")

 
    if resp.status_code == 403:
        
        return BusLocation(
            lat=12.963484,
            lng=77.580299,
            heading=275.0,
            nextStop="KR Market (Towards Chamarajapete)",
            previousStop="Corporation (Towards KR Market )",
            lastUpdated="28-11-2025 06:23:22",
            routeId=2965,
            routeNo="15-G",
            vehicleId=vehicle_id,
            vehicleNo="KA57F2965",
            tripStatus="Running (MOCK – BMTC 403)",
            eta="06:25",
        )
  

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"BMTC API returned {resp.status_code}: {resp.text[:200]}",
        )

    data = resp.json()

    try:
        route_details = data["RouteDetails"][0]
        live = data["LiveLocation"][0]
    except (KeyError, IndexError):
        raise HTTPException(status_code=500, detail="Unexpected BMTC response format")

    return BusLocation(
        lat=float(live.get("latitude") or live.get("currlatitude")),
        lng=float(live.get("longitude") or live.get("currlongitude")),
        heading=float(live.get("heading") or 0.0),
        nextStop=live.get("nextstop"),
        previousStop=live.get("previousstop"),
        lastUpdated=live.get("lastrefreshon") or route_details.get("lastupdatedat"),
        routeId=int(route_details.get("routeid")),
        routeNo=route_details.get("routeno"),
        vehicleId=int(route_details.get("vehicleid")),
        vehicleNo=route_details.get("busno") or live.get("vehiclenumber"),
        tripStatus=route_details.get("tripstatus"),
        eta=route_details.get("etastatus"),
    )


@app.get("/api/route/1672/stops", response_model=StopsResponse)
def get_15g_stops():
    """
    Hard-coded 15-G route stops based on your list.
    """
    stops_data = [
        ("Kempegowda Bus Station", 12.97751, 77.57141),
        ("Maharani College", 12.97703, 77.58580),
        ("KR Circle", 12.97386, 77.58661),
        ("St Marthas Hospital", 12.96945, 77.58716),
        ("Corporation", 12.96701, 77.58822),
        ("Town Hall", 12.96355, 77.58375),
        ("KR Market", 12.96368, 77.57742),
        ("Makkala Koota", 12.95664, 77.57383),
        ("Mahila Seva Samaja", 12.95362, 77.57379),
        ("National College", 12.94942, 77.57379),
        ("Basavanagudi Police Station", 12.94168, 77.57396),
        ("Nettakallappa Circle", 12.93917, 77.57175),
        ("Nagasandra Circle", 12.93697, 77.57208),
        ("Tata Silk Farm", 12.93589, 77.57384),
        ("MM Industries", 12.92950, 77.57372),
        ("Shastri Bakery", 12.92363, 77.57367),
        ("Monotype Corporation", 12.92154, 77.57104),
        ("Kaveri Nagara", 12.91986, 77.56931),
        ("Yarab Nagara", 12.91657, 77.56914),
        ("Kadirenahalli Cross", 12.91364, 77.56727),
        ("Dayananda Sagar College", 12.90948, 77.56553),
        ("Water Tank", 12.90847, 77.56169),
        ("Kumaraswamy Layout 2nd Stage", 12.90584, 77.55814),
    ]

    stops = [
        Stop(name=name, lat=lat, lng=lng, sequence=i + 1)
        for i, (name, lat, lng) in enumerate(stops_data)
    ]

    return StopsResponse(
        routeId=1672,
        routeNo="15-G",
        direction="KBS → Kumaraswamy Layout 2nd Stage",
        stops=stops,
    )


@app.get("/api/route/{route_id}/points/raw")
def get_route_points_raw(route_id: int):
    """
    Proxy BMTC /RoutePoints directly (for debugging / exploration).
    """
    url = f"{BMTC_BASE_URL}/RoutePoints"
    payload = {"routeid": route_id}
    headers = make_bmtc_headers()

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=8)
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Error contacting BMTC API: {e}")

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"BMTC API returned {resp.status_code}: {resp.text[:200]}",
        )

    return resp.json()
