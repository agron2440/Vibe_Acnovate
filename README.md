# Chart Generator & Editor Application

A REACT utility application that connects to VibeIQ using the Contrail Extensions SDK and generates a chart using the [Recharts](https://recharts.github.io/) library.
The utility allows users to enter data and select pre-defined chart types to generate the chart and add it to the showcase frame currently being viewed.

## Features

### Supported Chart Types and Variants

| Chart Types | Variants |
| ----------- | -------- |
| Bar Chart | Grouped, Stacked, 100% Stacked, Horizontal |
| Line Chart | Smooth, Linear, Step |
| Area Chart | Overlapping, Stacked, 100% Stacked, Step |
| Pie Chart | Pie, Donut, Half Circle |
| Scatter Chart | Points, Bubble |
| Radar Chart | Filled, Outline, With dots |

### Add Series & Rows

The chart data editor comes with a grid interface allowing users to add as many series and rows on demand to make charts with same details like a powerpoint application.

### Customize Colors for Series/Rows

Depending on the chart type, you can customize the color for each of the series/rows depending on chart type to get a chart which matches your theeme. The charts are later added to the VibeIQ as a PNG image with a transparent background so that it takes the frame's theme where it has been added.

## How to Test/Debug

1. Clone the git repository into your local system which must contain Node.js installation.
2. Open command shell on project root and execute the command ```npm install``` to install all dependencies.
3. Execute ```npm run dev``` on the same folder as above command to start the server locally.
4. Open http://localhost:5173 to navigate to the app which should load the application with a loading spinner due to missing connection to VibeIQ application.
5. Open VibeIQ's Showcase app and open a showcase content frame where you want to do the testing.
6. Press ```Ctrl + Shift + D``` to enable the Developer's Mode in VibeIQ.
7. Click on the Magic Wand icon and look for "Local Extension" menu under it.
8. Select the "Local Extension" and in the pop up window, insert the local host URL of step (4).
9. App can now be locally tested/debugged.

