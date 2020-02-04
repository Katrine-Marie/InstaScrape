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
    value: function assign(target, varArgs) {
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

var InstaScrape = (function(){
    var defaults = {
        'host': "https://www.instagram.com/",
        'username': '',
        'tag': '',
        'container': '',
        'get_data': false,
        'callback': null,
        'items': 12,
        'image_size': 640
    };

    var image_sizes = {
        "150": 0,
        "240": 1,
        "320": 2,
        "480": 3,
        "640": 4
    };

    return function(opts){
        this.options = Object.assign({}, defaults);
        this.options = Object.assign(this.options, opts);
        this.is_tag = this.options.username == "";

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
            var url = this.is_tag ? this.options.host + "explore/tags/" + this.options.tag : this.options.host + this.options.username,
                xhr = new XMLHttpRequest();

            var _this = this;
            xhr.onload = function(e){
                if(xhr.readyState === 4){
                    if (xhr.status === 200) {
                        var data = xhr.responseText.split("window._sharedData = ")[1].split("<\/script>")[0];
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
            return (this.is_tag ? data.name : data.username) + " image ";
        }

        this.display = function(data){
          var max = '';
          var html = '';

            // Gallery
            var image_index = typeof image_sizes[this.options.image_size] !== "undefined" ? image_sizes[this.options.image_size] : image_sizes[640];

            if(typeof data.is_private !== "undefined" && data.is_private === true){
              console.log('This profile is private');
            }else{
              var imgs = (data.edge_owner_to_timeline_media || data.edge_hashtag_to_media).edges;
                max = (imgs.length > this.options.items) ? this.options.items : imgs.length;

                html = '';

                html += "<div class='instagram_gallery'>";

                for(var i = 0; i < max; i++){
                    var url = "https://www.instagram.com/p/" + imgs[i].node.shortcode,
                    image, type_resource,
                    caption = this.parse_caption(imgs[i], data);

                    switch(imgs[i].node.__typename){
                      case "GraphSidecar":
                        type_resource = "sidecar"
                        image = imgs[i].node.thumbnail_resources[image_index].src;
                        break;
                      case "GraphVideo":
                        type_resource = "video";
                        image = imgs[i].node.thumbnail_src
                      break;
                        default:
                        type_resource = "image";
                        image = imgs[i].node.thumbnail_resources[image_index].src;
                      }

                      if (this.is_tag) data.username = '';
                      html += "<a href='" + url +"' class='instagram-" + type_resource + "' title='" + caption.substring(1, 100) +"' rel='noopener' target='_blank'>";
                      html += "<img src='" + image + "' alt='" + caption.substring(1, 100) + " />";
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
