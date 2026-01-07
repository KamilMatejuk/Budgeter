import datetime


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
    def subtract(a: float, b: float) -> float:
        return Value._double_precision((100 * a - 100 * b) / 100)

    @staticmethod
    def multiply(a: float, b: float) -> float:
        return Value._double_precision((100 * a * b) / 100)
    
    @staticmethod
    def divide(a: float, b: float) -> float:
        return Value._double_precision((100 * a / b) / 100)


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
        return (date + datetime.timedelta(days=32)).replace(day=1)

    @staticmethod
    def add_months(date: datetime.date, months: int) -> datetime.date:
        month = date.month + months
        if month > 12: year = date.year + 1
        elif month < 1: year = date.year - 1
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
