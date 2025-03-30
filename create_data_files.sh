#!/bin/bash

# Start and end dates (April 1, 2025 to August 31, 2025)
start_date="2025-04-01"
end_date="2025-08-31"

# Convert to seconds since epoch
start_sec=$(date -d "$start_date" +%s)
end_sec=$(date -d "$end_date" +%s)

current_sec=$start_sec

while [ $current_sec -le $end_sec ]; do
    # Get YYYYMM and DD
    yyyymm=$(date -d "@$current_sec" +%Y%m)
    day=$(date -d "@$current_sec" +%d)
    weekday=$(date -d "@$current_sec" +%u) # 1=Mon, 7=Sun
    
    # Skip Sundays (weekday 7)
    if [ "$weekday" -ne 7 ]; then
        # Create monthly folder if it doesn’t exist
        mkdir -p "data/$yyyymm"
        # Create empty file
        touch "data/$yyyymm/$yyyymm$day.txt"
    fi
    
    # Increment by 1 day
    current_sec=$((current_sec + 86400))
done

echo "Data files created!"