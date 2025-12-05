#!/usr/bin/env python3

##############################
# Script to graph input data #
##############################

import os
import json
import sys

def print_table(input_data, floats=0.0, chart_type="normal"):
    """
    Function to print formatted table to stdout
    Dynamically assesses size of columns and then formats and prints table_data entries
    input_data is in format:
    {
        col1: {
                row1: val1,
                row2: val2
              },
        col2: {
                row2: val2,
                row3: val3
              }
    }
    """

    # Handle empty rankings
    if chart_type != "rarecmd":
        input_data = {k: v for k, v in input_data.items() if v.keys()}
        if len(input_data) == 1 and chart_type in ["normal", "totals", "summary", "summarytotals"]:
            chart_type = "rare"
    else:
        chart_type = "rare"

    # Get sorted set of rows
    table_rows = sorted({row for user in input_data for row in input_data[user]})

    if chart_type == "twoper":
        table_rows = sorted(int(row) for row in table_rows)

    table_data = [["", *input_data.keys()]]

    user_min = 1
    if "summary" in chart_type:
        user_min = len(input_data)/5+1
    if chart_type == "summarytotals":
        chart_type = "totals"

    if chart_type != "twoper":
        for row in table_rows:
            if len([item for item in [input_data[user][row] if row in input_data[user] else None for user in input_data] if item is not None]) <= user_min and chart_type != "rare":
                continue
            table_row = [float(input_data[user][row]) if row in input_data[user] else None for user in input_data]
            best_score = max([item if item is not None else 0.0 for item in table_row])
            total = sum([item if item is not None else 0.0 for item in table_row])
            table_row = [row] + [f"{item:{floats}f}" if item != best_score and item is not None else (f"{item:{floats}f}💥" if item == best_score else item) for item in table_row]
            if chart_type == "totals":
                table_row.append(str(int(total)))
            table_data.append(table_row)
    else:
        max_sub_cols = {}
        # This is where 2 cols per row is really assumed - can probably make # dynamic in future
        for idx, user in enumerate(input_data):
            max_sub_cols[idx] = {}
            for num in range(2):
                max_col = max([len(input_data[user][row].split()[num]) if ' ' in input_data[user][row] else None for row in input_data[user]])
                max_sub_cols[idx][num] = max_col
        for row in table_rows:
            row = str(row)
            table_row = [str(input_data[user][row]) if row in input_data[user] else "" for user in input_data]
            row_data = []

            for idx, item in enumerate(table_row):
                if ' ' in item:
                    col_data = []
                    for col_idx, col in enumerate(item.split()):
                        col_data.append(f"{col:<{max_sub_cols[idx][col_idx]}}")
                    row_data.append(str(" | ".join(col_data)))
                else:
                    row_data.append(str(item))
            table_row = [row] + row_data
            table_data.append(table_row)

    if chart_type == "totals":
        table_data[0].append("total")

    # Assess size of output columns
    col_lengths = []

    # Iterate over table entries for longest value per column
    for col in range(len(table_data[0])):
        # Find longest string in table_data entries for specific column
        max_key = max([str(entry[col]) for entry in table_data], key=len)
        # Get the maximum column length for col between longest value and column header
        col_lengths.append(len(max_key))

    # Fix first length if chart will have total line
    if chart_type == "totals":
        col_lengths[0] = 5 if col_lengths[0] < 5 else col_lengths[0]

    # Establish header and divider - header uses keys from table_data's dict for column titles
    header  = " "+" |  ".join([f'{header:^{col_lengths[col]}s}'
                              for col, header in enumerate(table_data[0])])+" "
    divider = "-"+"-|--".join([f'-'*col_lengths[col] for col in range(len(table_data[0]))])+"-"

    # Iterate over table_data entries to populate data lines
    data_lines = []
    colors = ["\033[100m", "\033[49m"] # Array used to alternate bg colors
    format_specifier = '<'
    if chart_type == "twoper": format_specifier = '^'
    for num, data in enumerate(table_data):
        if num == 0: continue
        color = colors[num % 2]
        data_line = f"{color} "+" | ".join(
                   [f'{str(item):{format_specifier}{col_lengths[col]+1 if "💥" not in item and col > 0 else col_lengths[col]}s}' if item is not None else f'{" ":^{col_lengths[col]+1}s}'
                    for col, item in enumerate(data)])+" \033[0m"
        data_lines.append(data_line)

    extras = []
    # Add total line at bottom for totals tables
    if chart_type == "totals":
        extras.append(divider)
        totals_line = ["total"] + ([0]*(len(table_data[0])-2)) + ['']
        for idx, tot in enumerate(totals_line):
            if idx == 0:
                continue
            totals_line[idx] = sum([int(item[idx].rstrip('💥')) if item[idx] is not None else 0 for item in table_data[1:]])
        totals_line = " "+" | ".join(
                    [f'{str(item):<{col_lengths[col]+1 if col > 0 else col_lengths[col]}s}' if item is not None else f'{" ":^{col_lengths[col]+1}s}'
                    for col, item in enumerate(totals_line)])
        extras.append(totals_line)

    # Print saved lines to stdout
    print('\n'.join([header, divider, *data_lines, *extras])+'\n')


def main():
    input_data = json.loads(sys.argv[1])
    floats = 0.0
    chart_type = "normal"

    if len(sys.argv) > 2:
        floats = sys.argv[2]
    if len(sys.argv) > 3:
        chart_type = sys.argv[3]

    print_table(input_data, floats, chart_type)


if __name__ == '__main__':
    try:
        main()
    except:
        exc_type, value, _ = sys.exc_info()
        print(f"ERROR in table gen: {exc_type.__name__}: {value}")

