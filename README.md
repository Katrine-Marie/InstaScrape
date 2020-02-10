# InstaScrape
An unopinionated Instagram scraper function, returning content corresponding to an Instagram username. It is entirely up to you how you want it displayed.

## Usage

### Basic Usage
```
new InstaScrape({
  'username': 'instagram',
  'container': document.querySelector('.instascrape')
});
```

Define a username (or a tag), and a container in which to display the content.

### Options and defaults

Mandatory
* `username`: Username for the account you wish to get data from.
* `tag`: Alternative to username, you can also define a tag.
* `container`: The selector of a container, you want the data displayed in.

Optional
* `items`: Number of items to display. Default: 8.
* `imageSize`: Size of images returned, in pixels. Default: 640.
* `imagesOnly`: Choose to only retrieve images, and not other content types such as videos. Default: false.
* `anchorWrapper`: Wrap each element in a link to its Instagram post.
* `showCaption`: Show also captions for the images.  

## Notes
This Instagram scraper was inspired by [InstagramFeed](https://github.com/jsanahuja/InstagramFeed), and makes use of this [Object.assign polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill) for IE11 compatibility.
