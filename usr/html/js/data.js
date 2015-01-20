var CompoundDataItem, DataItem, DataNode;
var __slice = Array.prototype.slice;
$.ajaxSetup({
  url: DATA_URL,
  dataType: 'json'
});
DataItem = (function() {
  function DataItem(item, value) {
    this.item = item;
    this.value = value != null ? value : '';
  }
  DataItem.prototype.update = function(successCallback, errorCallback, callbackContext) {
    if (successCallback == null) {
      successCallback = false;
    }
    if (errorCallback == null) {
      errorCallback = false;
    }
    if (callbackContext == null) {
      callbackContext = this;
    }
    return $.ajax({
      data: {
        item: this.item
      },
      context: this,
      success: function(data, textStatus, jqXHR) {
        this.error = false;
        this.value = data.value;
        if (successCallback) {
          return successCallback.call(callbackContext);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        this.error = textStatus;
        if (errorCallback) {
          return errorCallback.call(callbackContext);
        }
      }
    });
  };
  DataItem.prototype.toString = function() {
    var _ref;
    return (_ref = this.value) != null ? _ref : '';
  };
  return DataItem;
})();
CompoundDataItem = (function() {
  function CompoundDataItem() {
    var items;
    items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.items = items;
  }
  CompoundDataItem.prototype.update = function(successCallback, errorCallback, callbackContext) {
    var item, _i, _len, _ref, _results;
    _ref = this.items;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _results.push(item.update(successCallback, errorCallback, callbackContext));
    }
    return _results;
  };
  CompoundDataItem.prototype.toString = function() {
    var item, strings, _i, _len, _ref;
    _ref = this.items;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      strings = item.toString();
    }
    return strings.join('; ');
  };
  return CompoundDataItem;
})();
DataNode = (function() {
  function DataNode(node, item) {
    this.node = node;
    this.item = item;
  }
  DataNode.prototype.update = function() {
    return this.item.update((function() {
      return this.node.html(this.item.toString());
    }), null, this);
  };
  return DataNode;
})();