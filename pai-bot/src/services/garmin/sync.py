#!/usr/bin/env python3
"""Garmin Connect 數據同步腳本"""

import json
import sys
from datetime import date
from pathlib import Path

# Token 快取路徑
TOKEN_DIR = Path(__file__).parent / ".garmin_tokens"


def get_client(email: str, password: str):
    """取得 Garmin 客戶端（支援 token 快取）"""
    from garminconnect import Garmin

    TOKEN_DIR.mkdir(exist_ok=True)
    token_file = TOKEN_DIR / "token.json"

    client = Garmin(email, password)

    # 嘗試使用快取的 token
    if token_file.exists():
        try:
            client.login(token_file)
            return client
        except Exception:
            # Token 過期，重新登入
            pass

    # 完整登入
    client.login()
    client.garth.dump(str(token_file))
    return client


def get_stats(client, target_date: str | None = None) -> dict:
    """取得每日統計"""
    d = target_date or date.today().isoformat()
    try:
        stats = client.get_stats(d)
        return {
            "date": d,
            "steps": stats.get("totalSteps", 0),
            "totalSteps": stats.get("totalSteps", 0),
            "stepGoal": stats.get("dailyStepGoal", 10000),
            "floorsAscended": stats.get("floorsAscended", 0),
            "floorsDescended": stats.get("floorsDescended", 0),
            "activeKilocalories": stats.get("activeKilocalories", 0),
            "totalKilocalories": stats.get("totalKilocalories", 0),
            "restingHeartRate": stats.get("restingHeartRate", 0),
            "minHeartRate": stats.get("minHeartRate", 0),
            "maxHeartRate": stats.get("maxHeartRate", 0),
            "averageStressLevel": stats.get("averageStressLevel", 0),
            "maxStressLevel": stats.get("maxStressLevel", 0),
            "stressDuration": stats.get("stressDuration", 0),
            "restStressDuration": stats.get("restStressDuration", 0),
            "bodyBatteryChargedValue": stats.get("bodyBatteryChargedValue", 0),
            "bodyBatteryDrainedValue": stats.get("bodyBatteryDrainedValue", 0),
            "bodyBatteryHighestValue": stats.get("bodyBatteryHighestValue", 0),
            "bodyBatteryLowestValue": stats.get("bodyBatteryLowestValue", 0),
        }
    except Exception as e:
        return {"error": str(e)}


def get_sleep(client, target_date: str | None = None) -> dict:
    """取得睡眠數據"""
    d = target_date or date.today().isoformat()
    try:
        sleep = client.get_sleep_data(d)
        if not sleep:
            return {"date": d, "error": "No sleep data"}

        daily = sleep.get("dailySleepDTO", {})
        scores = sleep.get("sleepScores", {})

        return {
            "date": d,
            "sleepTimeSeconds": daily.get("sleepTimeSeconds", 0),
            "sleepStartTimestampGMT": daily.get("sleepStartTimestampGMT", 0),
            "sleepEndTimestampGMT": daily.get("sleepEndTimestampGMT", 0),
            "deepSleepSeconds": daily.get("deepSleepSeconds", 0),
            "lightSleepSeconds": daily.get("lightSleepSeconds", 0),
            "remSleepSeconds": daily.get("remSleepSeconds", 0),
            "awakeSleepSeconds": daily.get("awakeSleepSeconds", 0),
            "averageSpO2Value": daily.get("averageSpO2Value", 0),
            "lowestSpO2Value": daily.get("lowestSpO2Value", 0),
            "averageRespirationValue": daily.get("averageRespirationValue", 0),
            "sleepScores": {
                "overall": scores.get("overall", {}).get("value", 0),
                "quality": scores.get("quality", {}).get("qualifierKey", "UNKNOWN"),
                "recovery": scores.get("recoveryScore", {}).get("value", 0),
                "restfulness": scores.get("restfulness", {}).get("qualifierKey", "UNKNOWN"),
            },
        }
    except Exception as e:
        return {"date": d, "error": str(e)}


def get_activities(client, limit: int = 10) -> list:
    """取得最近活動"""
    try:
        activities = client.get_activities(0, limit)
        result = []
        for a in activities:
            result.append(
                {
                    "activityId": a.get("activityId"),
                    "activityName": a.get("activityName", ""),
                    "startTimeLocal": a.get("startTimeLocal", ""),
                    "activityType": a.get("activityType", {}).get("typeKey", ""),
                    "distance": a.get("distance", 0),
                    "duration": a.get("duration", 0),
                    "elapsedDuration": a.get("elapsedDuration", 0),
                    "movingDuration": a.get("movingDuration", 0),
                    "averageSpeed": a.get("averageSpeed", 0),
                    "maxSpeed": a.get("maxSpeed", 0),
                    "calories": a.get("calories", 0),
                    "averageHR": a.get("averageHR", 0),
                    "maxHR": a.get("maxHR", 0),
                    "steps": a.get("steps", 0),
                }
            )
        return result
    except Exception as e:
        return [{"error": str(e)}]


def get_heart_rates(client, target_date: str | None = None) -> dict:
    """取得心率數據"""
    d = target_date or date.today().isoformat()
    try:
        hr = client.get_heart_rates(d)
        values = []
        for item in hr.get("heartRateValues", []) or []:
            if item and len(item) >= 2 and item[1] is not None:
                values.append(
                    {
                        "timestamp": item[0],
                        "heartRate": item[1],
                    }
                )

        return {
            "date": d,
            "restingHeartRate": hr.get("restingHeartRate", 0),
            "minHeartRate": hr.get("minHeartRate", 0),
            "maxHeartRate": hr.get("maxHeartRate", 0),
            "heartRateValues": values,
        }
    except Exception as e:
        return {"date": d, "error": str(e)}


def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Usage: sync.py <email> <password> <command> [args]"}))
        sys.exit(1)

    email = sys.argv[1]
    password = sys.argv[2]
    command = sys.argv[3]
    args = sys.argv[4:] if len(sys.argv) > 4 else []

    try:
        client = get_client(email, password)

        if command == "stats":
            result = get_stats(client, args[0] if args else None)
        elif command == "sleep":
            result = get_sleep(client, args[0] if args else None)
        elif command == "activities":
            limit = int(args[0]) if args else 10
            result = get_activities(client, limit)
        elif command == "heart":
            result = get_heart_rates(client, args[0] if args else None)
        elif command == "all":
            # 取得所有數據
            target_date = args[0] if args else None
            result = {
                "stats": get_stats(client, target_date),
                "sleep": get_sleep(client, target_date),
                "activities": get_activities(client, 5),
            }
        else:
            result = {"error": f"Unknown command: {command}"}

        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
