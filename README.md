## Usage

This package is part of the [expressa-framework](https://github.com/thomas4019/expressa).
Please follow the instruction [here](https://github.com/thomas4019/expressa)

## Optional themes 

* [zen](https://github.com/coderofsalvation/expressa-admin-theme-zen)

## Customizing

You can provide your own index.html to personalize things further.

* copy `node_modules/expressa-admin/index.html` into your application rootfolder (`admin.html` e.g.).

Now put this redirect-code in your application (`app.js` e.g.) to override the default index.html

    app.get('/admin/', >(req, res, next){
      var index = fs.readFileSync( __dirname+'/admin.html').toString()
      res.set({"content-type": "text/html"})
      res.send( index )
      res.end()
    })
    app.use('/admin', expressa.admin() )

> Voila! that's it..now you can add own stylesheet/javascript where necessary.

#### Display only certain columns in collection overviews 

To specify which columns to (not) display, put this somewhere in your schema:

        {     
          "_id": "isers",
          "schema": {
          "type": "object",
     ->   "listing":{
     ->       "columns":["email", "fullName"]
     ->   },
          "properties":{
             ...     

#### Edit screens

The admin-interface heavily uses the awesome [json-editor](https://npmjs.org/package/json-editor).
You can pass json-editor configuration in your schema (`data/collection/post.json` e.g.) like so:

      {     
        "_id": "post",
        "schema": {
          "type": "object",
          "additionalProperties": false,
    ->    "format":"tabs",                                                                                                                                                                                                               
    ->    "editor":{
    ->      "disable_properties": true
    ->    },    
          "properties":{
             ...     

#### Inject js into specific pages

Here's a way to inject your own behaviour into certain pages (hacky but works in most cases):

    var events = {
      '/edit\/post/': >(url){
        if( !confirm('Don't add posts without drinking coffee') ) history.back()
      }
    }

    if(("onhashchange" in window) && navigator.userAgent.toLowerCase().indexOf('msie') == -1){ // event supported?
      window.onhashchange = >(){
        var url = window.location.hash.substring(1);
        for ( var regex in events  )                                                                                                                                                                  
          if( url.match( new RegExp(regex) ) != null ) setTimeout( events[regex].bind(@,url), 100 )
      }
    }

#### WYSIWIG / Rich content 

Use a custom `index.html` (see above) and put this inside `<head>`

    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <link rel="stylesheet" href="minified/themes/square.min.css" type="text/css" media="all" />
    <script type="text/javascript" src="minified/jquery.sceditor.bbcode.min.js" defer></script>

Make sure you got [sceditor](https://npmjs.org/package/sceditor) installed.
