# Template Plugin #

## Introduction ##

The template plugin provides allows for bundling of handlebars templates with the dependent javascript
code, allowing templates to be kept in separate files and removing any need for additional requests to
load the templates required by a given module.

## Usage ##

The template plugin looks for a `template` configuration object defined on the root lumbar config.
This object should be a hash of javascript pathnames whose values are arrays of template files. on build,
each module that includes a file listed in this hash will have the associated templates defined at least
once in the output.

### Configuration ###

  * `precompile` : Options to pass to handlebars precompile method if precompilation is desired. Leave
        falsy or undefined to load the templates through client-side compilation.
  * `templateCache` : Object that templates will be assigned to. This field is defined on the root config
        and defaults to `{AppModule}.templates` where {AppModule} is the name of the application module.
        This instance can be any object and should be manually defined by the client code.

## Example ##

    {
      "modules": {
        "base": [
          {"src": "js/base.js"}
        ]
      },
      "templates": {
        "js/base.js": [
          "templates/home.handlebars",
          "templates/footer.handlebars"
        ],

        "precompile": {
          "knownHelpers": [
            "template",
            "view"
          ],
          "knownHelpersOnly": true
        }
      },

      "templateCache": "TemplateCache"
    }

