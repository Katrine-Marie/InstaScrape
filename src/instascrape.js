/*
 * InstaScrape
 *
 * @version 1.0.0
 *
 * @author Katrine-Marie Burmeister
 *
 * https://github.com/jsanahuja/InstagramFeed
 *
 */

 // Added for IE11 compatibility
 if (typeof Object.assign != 'function') {
  Object.defineProperty(Object, "assign", {
    value: function assign(target) {
      'use strict';
      if (target == null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          for (var nextKey in nextSource) {

            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

let InstaScrape = (function(){
    let defaults = {
        'host': "https://www.instagram.com/",
        'username': '',
        'tag': '',
        'container': '',
        'get_data': false,
        'callback': null,
        'items': 8,
        'imageSize': 640
    };

    const imageSizes = {
        "150": 0,
        "240": 1,
        "320": 2,
        "480": 3,
        "640": 4
    };

    return function(opts){
        this.options = Object.assign({}, defaults);
        this.options = Object.assign(this.options, opts);
        this.isTag = this.options.username == "";

        this.valid = true;
        if(this.options.username == "" && this.options.tag == ""){
            console.error("InstaScrape: Error: Missing username.");
            this.valid = false;
        }else if(!this.options.get_data && this.options.container == ""){
            console.error("InstaScrape: Error, no container found.");
            this.valid = false;
        }else if(this.options.get_data && typeof this.options.callback != "function"){
            console.error("InstaScrape: Error, invalid or undefined callback for get_data");
            this.valid = false;
        }

        this.get = function(callback){
            let url = this.isTag ? this.options.host + "explore/tags/" + this.options.tag : this.options.host + this.options.username,
                xhr = new XMLHttpRequest();

            let _this = this;
            xhr.onload = function(e){
                if(xhr.readyState === 4){
                    if (xhr.status === 200) {
                        let data = xhr.responseText.split("window._sharedData = ")[1].split("<\/script>")[0];
                        data = JSON.parse(data.substr(0, data.length - 1));
                        data = data.entry_data.ProfilePage || data.entry_data.TagPage || null;
                        if(data === null){
                            console.log(url);
                            console.error("InstaScrape: Request error. No data retrieved: " + xhr.statusText);
                        }else{
                            data = data[0].graphql.user || data[0].graphql.hashtag;
                            callback(data, _this);
                        }
                    } else {
                        console.error("InstaScrape: Request error. Response: " + xhr.statusText);
                    }
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
        };

        this.parse_caption = function(igobj, data){
            if(typeof igobj.node.edge_media_to_caption.edges[0] !== "undefined" && igobj.node.edge_media_to_caption.edges[0].node.text.length != 0){
                return igobj.node.edge_media_to_caption.edges[0].node.text;
            }

            if(typeof igobj.node.title !== "undefined" && igobj.node.title.length != 0){
                return igobj.node.title;
            }

            if(typeof igobj.node.accessibility_caption !== "undefined" && igobj.node.accessibility_caption.length != 0){
                return igobj.node.accessibility_caption;
            }
            return (this.isTag ? data.name : data.username) + " image ";
        }

        this.display = function(data){
          let max = '';
          let html = '';

            // Gallery
            let image_index = typeof imageSizes[this.options.imageSize] !== "undefined" ? imageSizes[this.options.imageSize] : imageSizes[640];

            if(typeof data.is_private !== "undefined" && data.is_private === true){
              console.log('This profile is private');
            }else{
              let imgs = (data.edge_owner_to_timeline_media || data.edge_hashtag_to_media).edges;
                max = (imgs.length > this.options.items) ? this.options.items : imgs.length;

                html = '';

                html += "<div class='instagram_gallery'>";

                for(var i = 0; i < max; i++){
                    let url = "https://www.instagram.com/p/" + imgs[i].node.shortcode,
                    image, typeResource,
                    caption = this.parse_caption(imgs[i], data);

                    switch(imgs[i].node.__typename){
                      case "GraphSidecar":
                        typeResource = "sidecar"
                        image = imgs[i].node.thumbnail_resources[image_index].src;
                        break;
                      case "GraphVideo":
                        typeResource = "video";
                        image = imgs[i].node.thumbnail_src
                      break;
                        default:
                        typeResource = "image";
                        image = imgs[i].node.thumbnail_resources[image_index].src;
                      }

                      if (this.isTag) data.username = '';
                      html += "<a href='" + url +"' class='instagram-" + typeResource + "' title='" + caption.substring(0, 100) + "' rel='noopener' target='_blank'>";
                      html += "<img src='" + image + "' alt='" + caption.substring(0, 100) + "' />";
                      html += "</a>";
                    }

                    html += "</div>";
                }

            this.options.container.innerHTML = html;
        };

        this.run = function(){
            this.get(function(data, instance){
                if(instance.options.get_data)
                    instance.options.callback(data);
                else
                    instance.display(data);
            });
        };

        if(this.valid){
            this.run();
        }
    };
})();
