![logo](contrib/icon.png)

# Heatseeker for Visual Studio Code

Color your source code depending on how often each line is executed.

## Installation

From the commandline:

```
code --install-extension mrkanister.heatseeker
```

From within VSCode:

1. Hit <kbd>command</kbd> + <kbd>P</kbd>
2. Type `ext install heatseeker`
3. Install the extension from the sidebar

## Getting started

Go to the settings and configure the host where heatseeker is running:

```
"heatseeker.host": "http://example.com",
```

You can configure heatseeker with the following additional parameters in the settings:

```
// Specifies the opacity of the backgrund colors as a floating point number between 0 and 1.
"heatseeker.background.opacity": 0.5,

// Always use latest data from server instead of current commit id
"heatseeker.latest": false
```


## Credits

The [Center of Gravity][1] icon distributed by [Icons8][2] under the
[Creative Commons Attribution-NoDerivs 3.0 Unported][2] license.

[1]: https://icons8.com/icon/13387/center-of-gravity
[2]: https://icons8.com/
[3]: https://creativecommons.org/licenses/by-nd/3.0/
