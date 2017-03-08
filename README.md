## Usage

This package is part of the [expressa-framework](https://github.com/thomas4019/expressa).
Please follow the instruction [here](https://github.com/thomas4019/expressa)

## Customizing

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

