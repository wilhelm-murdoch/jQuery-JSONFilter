(function($){
  $.fn.JSONFilter = function(options) {
    var options = $.extend({
      data: {},
      root: '',
      nodes: [],
      minTokenLength: 3,
      minOverallLength: 4,
      onCountUpdate: function(count) { },
      onMatch: function(item) { }
    }, options);

    if($.JSONPath === undefined) {
      $.error('JSONPath dependancy not found.')
      return
    }

    var path = $.JSONPath({
      data: options.data,
      keepHistory: false,
      resultType: 'BOTH'
    })

    root = path.find(options.root)
    if(root === false) {
      $.error('Root node is invalid.')
      return
    }

    this.root = root[0]
    if(this.root.value.length) {
      this.count = this.root.value.length
    } else {
      this.count = 0
    }
    options.onCountUpdate(this.count)

    this.options = function(updated_options) {
      options = $.extend(options, updated_options)
      return this
    }

    function getIndex(item) {
      var rootLength = this.root[0].query.split(';').length
      return item.query.split(';').splice(rootLength, 1).pop()
    }

    this.scored = {}
    function scoreMatched(matched) {
      var scored = this.scored
      $.each(matched, function(i, item) {
        var index = getIndex(item)
        if(scored.hasOwnProperty(index)) {
          scored[index]++
        } else {
          scored[index] = 0
        }
      })
      return
    }

    var methods = {
      filter: function(e) {
        var scope = $(this)

        switch(e.keyCode) {
          case 9:  // tab
          case 13: // enter
          case 27: // escape
          case 32: // escape
            e.preventDefault()
            return
        }

        if(scope.val().length < options.minOverallLength) {
          return
        }

        tokens = scope.val().toLowerCase().match(/\w+/g)

        $.each(tokens, function(ti, token) {
          if(options.minTokenLength && token.length < options.minTokenLength) {
            return
          }

          $.each(options.nodes, function(ni, node) {
            items = path.find(node)
            matched = $.grep(items, function(item) {
              return ~item.value.toLowerCase().indexOf(token)
            })
            // options.onMatch(matched)
            scoreMatched(matched)
          })
        })

        e.stopPropagation()
      }
    }

    this.each(function() {
      $(this).keyup(methods.filter)
    })

    return this
  }
})(jQuery);
