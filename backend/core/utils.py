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
    # fallback PLN per 1 unit of currency
    PLN_per_unit: dict[Currency, float] = {
        Currency.PLN: 1.00,
        Currency.USD: 3.50,
        Currency.EUR: 4.20,
        Currency.THB: 0.11,
        Currency.CZK: 0.17,
    }
    _rates: dict[datetime.date, dict[Currency, float]] | None = None
    MAX_DAYS_BACK = 10

    @staticmethod
    def convert(src: Currency, dst: Currency, date: datetime.date | None = None) -> float:
        if src == dst: return 1.0
        rates = Forex.PLN_per_unit
        # rates = Forex.get_rates(date)
        return rates[src] / rates[dst]
    
    @staticmethod
    def convert_to_pln(value: float, currency: Currency, date: datetime.date | None = None) -> float:
        rate = Forex.convert(currency, Currency.PLN, date)
        return Value.multiply(value, rate)
    
    @staticmethod
    def get_rates(date: datetime.date | None = None) -> dict[Currency, float]:
        if date is None: date = Date.today()
        history = Forex._get_history()
        for days_back in range(Forex.MAX_DAYS_BACK):
            day = date - datetime.timedelta(days=days_back)
            rates = history.get(day)
            if rates is not None and len(rates) == len(Currency): return rates
            rates = Forex._try_fetch(day)
            if rates is not None: return rates
        earlier = [d for d in history if d <= date]
        if earlier: return history[max(earlier)]
        return Forex.PLN_per_unit

    @staticmethod
    def _get_history() -> dict[datetime.date, dict[Currency, float]]:
        if Forex._rates is None:
            Forex._rates = Forex._read_rates_from_file()
        return Forex._rates

    @staticmethod
    def _try_fetch(date: datetime.date) -> dict[Currency, float] | None:
        try:
            rates = Forex._fetch_rates_from_nbp(date)
        except Exception as e:
            print(f"Failed to fetch NBP rates for {date}: {e}")
            return None
        if rates is None:
            return None
        history = Forex._get_history()
        history[date] = rates
        Forex._save(history)
        return rates

    @staticmethod
    def _read_rates_from_file() -> dict[datetime.date, dict[Currency, float]]:
        try:
            with open(Forex.filename, "r") as f:
                data = json.load(f)
            return {
                datetime.date.fromisoformat(d): {Currency.PLN: 1.0, **{Currency(c): float(r) for c, r in rates.items()}}
                for d, rates in data.items()
            }
        except Exception as e:
            print(f"Failed to read {Forex.filename}: {e}")
            return {}

    @staticmethod
    def _save(history: dict[datetime.date, dict[Currency, float]]) -> None:
        Forex._rates = dict(sorted(history.items()))
        lines = [
            f'"{d.isoformat()}": {json.dumps({c.value: r for c, r in rates.items() if c != Currency.PLN})}'
            for d, rates in Forex._rates.items()
        ]
        with open(Forex.filename, "w") as f:
            f.write("{\n" + ",\n".join(lines) + "\n}\n")

    @staticmethod
    def _fetch_rates_from_nbp(date: datetime.date) -> dict[Currency, float] | None:
        res = requests.get(f"https://api.nbp.pl/api/exchangerates/tables/A/{date.isoformat()}/?format=json", timeout=10)
        if res.status_code == 404: return None
        res.raise_for_status()
        nbp_rates = {item["code"]: float(item["mid"]) for item in res.json()[0]["rates"]}
        return {c: 1.0 if c == Currency.PLN else nbp_rates.get(c.value, Forex.PLN_per_unit[c]) for c in Currency}



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
