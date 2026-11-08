# macOS

## caffeinate

Making a script run on macOS, when you lock the screen doesn't work. The script will pause until you unlock the screen. There are many recommended  [options to try](https://discussions.apple.com/thread/253402016?sortBy=rank) but they simply don't work.

Luckily, there is an inbuilt terminal command that does the trick - `caffeinate`.

`caffeinate -di python my_script.py` - Makes a python script running, even when you lock the screen.

- `-d` - Prevents the display from turning off.
- `-i` - Prevents the system from entering idle sleep.

As soon as `my_script.py` finishes `caffeinate` will stop.

Alternative way of running `caffeinate` separately

```shell
caffeinate -di &
python my_script.py
```

The `&` at the end runs `caffeinate` in the background. macOS won’t sleep until you manually stop `caffeinate`.

To stop it, execute - `pkill caffeinate`

In case you are using the script with uv:

`caffeinate -di uv run python my_script.py`