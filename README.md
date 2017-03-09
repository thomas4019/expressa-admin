## Usage

This package is part of the [expressa-framework](https://github.com/thomas4019/expressa).
Please follow the instruction [here](https://github.com/thomas4019/expressa)

## Customizing

You can provide your own index.html to personalize things further.

* copy `node_modules/expressa-admin/index.html` into your application rootfolder (`admin.html` e.g.).

Now put this redirect-code in your application (`app.js` e.g.) to override the default index.html

    var index = fs.readFileSync( __dirname+'/admin.html').toString()
    app.get('/admin', >(req, res, next){
      res.set({"content-type": "text/html"})
      res.send( index )                                                                                                                                                                               
      res.end()
    })
    app.use('/admin', expressa.admin() )

> Voila! that's it..now you can add own stylesheet/javascript where necessary.

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

