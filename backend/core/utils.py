from typing import Iterable
import datetime
import requests
import json

from models.products import Currency


class Value:
    """Utility class to handle float values with two decimal places."""
    
    @staticmethod
    def parse(v: str | int | float) -> float:
        return Value._double_precision(float(v))

    @staticmethod
    def parse_negate(v: str | int | float) -> float:
        return Value._double_precision(-float(v))

    @staticmethod
    def _double_precision(v: float) -> float:
        return float(f'{v:.2f}')

    @staticmethod
    def add(a: float, b: float) -> float:
        return Value._double_precision((100 * a + 100 * b) / 100)
    
    @staticmethod
    def sum(iter: Iterable[float]) -> float:
        total = 0.0
        for v in iter:
            total = Value.add(total, v)
        return total

    @staticmethod
    def subtract(a: float, b: float) -> float:
        return Value._double_precision((100 * a - 100 * b) / 100)

    @staticmethod
    def multiply(a: float, b: float) -> float:
        return Value._double_precision((100 * a * b) / 100)
    
    @staticmethod
    def divide(a: float, b: float) -> float:
        return Value._double_precision((100 * a / b) / 100)
    
    @staticmethod
    def avg(iter: Iterable[float]) -> float:
        total = 0.0
        count = 0
        for v in iter:
            total = Value.add(total, v)
            count += 1
        if count == 0: return 0.0
        return Value.divide(total, count)


class Forex:
    """Utility class to handle currency conversion."""
    filename: str = "exchange_rates.json"
    PLN_per_USD = 3.50
    PLN_per_EUR = 4.20

    @staticmethod
    def convert(src: Currency, dst: Currency) -> float:
        if src == dst: return 1.0
        PLNUSD, PLNEUR = Forex.get_rates()
        if src == Currency.PLN and dst == Currency.USD: return 1.0 / PLNUSD
        if src == Currency.PLN and dst == Currency.EUR: return 1.0 / PLNEUR
        if src == Currency.USD and dst == Currency.PLN: return PLNUSD
        if src == Currency.USD and dst == Currency.EUR: return PLNUSD / PLNEUR
        if src == Currency.EUR and dst == Currency.PLN: return PLNEUR
        if src == Currency.EUR and dst == Currency.USD: return PLNEUR / PLNUSD
        return 1.0
    
    @staticmethod
    def convert_to_pln(value: float, currency: Currency) -> float:
        rate = Forex.convert(currency, Currency.PLN)
        return Value.multiply(value, rate)
    
    @staticmethod
    def get_rates() -> tuple[float, float] | None:
        res = Forex._read_rates_from_file()
        if res is not None: return res
        res = Forex._fetch_rates_from_nbp()
        if res is not None: return res
        return (Forex.PLN_per_USD, Forex.PLN_per_EUR)
    
    @staticmethod
    def _read_rates_from_file() -> tuple[float, float] | None:
        try:
            with open(Forex.filename, "r") as f:
                data = json.load(f)
                date = datetime.datetime.strptime(data["date"], "%Y-%m-%d").date()
                if (datetime.date.today() - date).days > 7: return None
                usd_rate = float(data["USD"])
                eur_rate = float(data["EUR"])
                return (usd_rate, eur_rate)
        except: return None
    
    @staticmethod
    def _fetch_rates_from_nbp() -> tuple[float, float] | None:
        try:
            res = requests.get("http://api.nbp.pl/api/exchangerates/tables/A/?format=json", timeout=5)
            res.raise_for_status()
            data = res.json()[0]
            date = datetime.datetime.strptime(data["effectiveDate"], "%Y-%m-%d").date()
            usd_rate = next(item for item in data["rates"] if item["code"] == "USD")["mid"]
            eur_rate = next(item for item in data["rates"] if item["code"] == "EUR")["mid"]
            with open(Forex.filename, "w") as f:
                json.dump({"date": date.isoformat(), "USD": usd_rate, "EUR": eur_rate}, f)
            return (usd_rate, eur_rate)
        except: return None



class Date:
    """Utility class to handle date operations."""
    
    @staticmethod
    def to_string(date: datetime.date) -> str:
        return date.isoformat()

    @staticmethod
    def today() -> datetime.date:
        return datetime.date.today()

    @staticmethod
    def this_month() -> datetime.date:
        today = datetime.date.today()
        return datetime.date(today.year, today.month, 1)
    
    @staticmethod
    def month_end(date: datetime.date) -> datetime.date:
        return Date.add_months(date, 1).replace(day=1) - datetime.timedelta(days=1)

    @staticmethod
    def add_months(date: datetime.date, months: int) -> datetime.date:
        month = date.month + months
        if month >= 12: year = date.year + 1; month = month % 12
        elif month < 1: year = date.year - 1; month = (month - 1) % 12 + 1
        else: year = date.year
        try:
            return date.replace(year=year, month=month)
        except ValueError:
            # Handle cases where the day is out of range for the month
            return datetime.date(year, month + 1, 1) - datetime.timedelta(days=1)
    
    @staticmethod
    def add_years(date: datetime.date, years: int) -> datetime.date:
        try:
            return date.replace(year=date.year + years)
        except ValueError:
            # Handle February 29 for leap years
            return date.replace(month=2, day=28, year=date.year + years)

    @staticmethod
    def condition(start: datetime.date = None, end: datetime.date = None) -> dict:
        condition = {}
        if start is not None:
            condition["$gte"] = start.isoformat()
        if end is not None:
            condition["$lte"] = end.isoformat()
        return condition

    @staticmethod
    def iterate_days(start: datetime.date, end: datetime.date = None):
        if end is None:
            end = Date.today()
        current_date = start
        while current_date <= end:
            yield current_date
            current_date += datetime.timedelta(days=1)

    @staticmethod
    def iterate_months(start: datetime.date, end: datetime.date = None):
        if end is None:
            end = Date.today()
        current_month, current_year = start.month, start.year
        while current_year < end.year or (current_year == end.year and current_month <= end.month):
            yield datetime.date(current_year, current_month, 1)
            if current_month == 12:
                current_month = 1
                current_year += 1
            else:
                current_month += 1
