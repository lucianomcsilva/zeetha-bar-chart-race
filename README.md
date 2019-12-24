![ros-bar-chart-race](race.gif)

Forked from https://github.com/ytdec/bar-chart-race.

Uses https://github.com/DLu/ros_metrics to gather data.

# Live

Smoother than the gif:

https://louise.world/ros-bar-chart-race/index.html

# Run locally

~~~
git clone https://github.com/chapulina/ros-bar-chart-race
cd ros-bar-chart-race
firefox index.html
~~~

# Generate data

:warning: This takes several hours.

~~~
cd ros-bar-chart-race
git clone https://github.com/DLu/ros_metrics
cd ros_metrics
python3 ../race.py
~~~
