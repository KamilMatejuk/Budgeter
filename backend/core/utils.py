class Value:
    """Utility class to handle float values with two decimal places."""

    @classmethod
    @staticmethod
    def _double_precision(v: float) -> float:
        return float(f'{v:.2f}')

    @classmethod
    @staticmethod
    def add(a: float, b: float) -> float:
        return Value._double_precision((100 * a + 100 * b) / 100)

    @classmethod
    @staticmethod
    def subtract(a: float, b: float) -> float:
        return Value._double_precision((100 * a - 100 * b) / 100)

    @classmethod
    @staticmethod
    def multiply(a: float, b: float) -> float:
        return Value._double_precision((100 * a * b) / 100)
    
    @classmethod
    @staticmethod
    def divide(a: float, b: float) -> float:
        return Value._double_precision((100 * a / b) / 100)
