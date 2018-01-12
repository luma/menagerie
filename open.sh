#/usr/bin/env bash

if [ -n "$BROWSER" ]; then
  $BROWSER 'book/index.html'
elif which xdg-open > /dev/null; then
  xdg-open 'book/index.html'
elif which gnome-open > /dev/null; then
  gnome-open 'book/index.html'
elif which open > /dev/null; then
  open book/index.html
else
  echo "Could not detect the web browser to use."
fi
