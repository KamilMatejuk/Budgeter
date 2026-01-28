#!/usr/bin/env bash

BASE_URL="https://static.nbp.pl/dane/kursy/xml"
# Dates
DATE_FULL=$(date +%Y-%m-%d)
DATE_SHORT=$(date +%y%m%d)
YEAR=$(date +%Y)
MONTH=$(date +%m)
DAY=$(date +%d)

# Calculate workday number in month (Mon–Fri)
workday=0
for d in $(seq -w 01 "$DAY"); do
  dow=$(date -d "$YEAR-$MONTH-$d" +%u) # 1=Mon .. 7=Sun
  if [[ "$dow" -le 5 ]]; then
    ((workday++))
  fi
done

found=false
XML_FILE=""
tried_numbers=()

# Try table numbers: N, N-1, ... N-5
for i in $(seq 0 5); do
  t=$((workday - i))
  (( t <= 0 )) && continue

  TABLE_NUM=$(printf "%03d" "$t")
  NAME="a${TABLE_NUM}z${DATE_SHORT}.xml"
  URL="${BASE_URL}/${NAME}"

  if curl -fs "$URL" -o kursy.xml; then
    XML_FILE="kursy.xml"
    found=true
    break
  fi
  tried_numbers+=("$TABLE_NUM")
done

if ! $found; then
  echo "No NBP table found" >&2
  echo "Tried workday numbers: ${tried_numbers[*]}" >&2
  echo "Tables are numered in each month from 001, workdays only" >&2
  echo "Try $BASE_URL/aNNNzYYMMDD.xml where N is number, Y is year, M is month, D is day" >&2
  exit 1
fi

XML_FILE="kursy.xml"

# Extract rates
extract_rate() {
  local code="$1"
  awk -v code="$code" '
    $0 ~ "<kod_waluty>[[:space:]]*"code"[[:space:]]*</kod_waluty>" {f=1}
    f && $0 ~ "<kurs_sredni>" {
      gsub(/.*<kurs_sredni>|<\/kurs_sredni>.*/, "", $0)
      print
      f=0
    }' "$XML_FILE" | tr ',' '.'
}

USD=$(extract_rate USD)
EUR=$(extract_rate EUR)
rm "$XML_FILE"

# update backend with new rates
CURR_FILE="backend/models/products.py"
sed -i "s/PLN_per_USD = [0-9.]\+/PLN_per_USD = $USD/" "$CURR_FILE"
sed -i "s/PLN_per_EUR = [0-9.]\+/PLN_per_EUR = $EUR/" "$CURR_FILE"

# commit changes
git add "$CURR_FILE"
git commit -m "Update forex rates: 1 USD = $USD PLN, 1 EUR = $EUR PLN"
git push
