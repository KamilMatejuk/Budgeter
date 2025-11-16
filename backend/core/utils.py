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
