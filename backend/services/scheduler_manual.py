import re
import pandas as pd
from pathlib import Path


class Scheduler:
    def __init__(self, requests, rooms, dentists, progress_state=None) -> None:
        self.requests = sorted(
            requests,
            key=lambda r: re.sub(r"\d+", lambda m: m.group().zfill(5), r.id),
        )

        self.req_map = {r.id: r for r in self.requests}

        print(self.req_map)


if __name__ == "__main__":
    base_path = Path(__file__).parent / ".." / "assets" / "data" / "case0_tiny_demo"
    df_requests = pd.read_csv(base_path / "requests.csv")
    df_docs = pd.read_csv(base_path / "doctors.csv")
    df_rooms = pd.read_csv(base_path / "rooms.csv")

    df_requests.rename(
        columns={
            "request_id": "id",
            "patient": "patient",
            "doctor_id": "dentist_id",
            "procedure_type": "procedure",
            "acceptable_room_type": "acceptable_room_type",
            "requested_start": "requested_time",
            "duration_min": "duration_min",
        },
        inplace=True,
    )

    df_requests = df_requests[
        [
            "id",
            "patient",
            "dentist_id",
            "procedure",
            "acceptable_room_type",
            "requested_time",
            "duration_min",
        ]
    ]

    print(df_requests)
    csp = Scheduler(requests={}, rooms={}, dentists={})
