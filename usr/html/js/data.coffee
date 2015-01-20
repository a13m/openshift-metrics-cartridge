# Set up ajax calls
$.ajaxSetup url: DATA_URL, dataType: 'json'

class DataItem
  constructor: (@item, @value='') ->
  
  update: (successCallback=false, errorCallback=false, callbackContext=this) ->
    $.ajax  data:
              item: @item
            context: this
            success: (data, textStatus, jqXHR) ->
              @error = false
              @value = data.value
              successCallback.call(callbackContext) if successCallback
            error: (jqXHR, textStatus, errorThrown) ->
              @error = textStatus
              errorCallback.call(callbackContext) if errorCallback
  
  toString: ->
    @value ? ''

class CompoundDataItem
  constructor: (@items...) ->
  
  update: (successCallback, errorCallback, callbackContext)->
    for item in @items
      item.update successCallback, errorCallback, callbackContext

  toString: ->
    strings = item.toString() for item in @items
    strings.join '; '

class DataNode
  constructor: (@node, @item) ->
    
  update: ->
    @item.update ( ->
        @node.html @item.toString()
      ),
      null,
      this