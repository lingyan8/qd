// Generated by CoffeeScript 1.12.7
(function() {
  define(function(require, exports, module) {
    var analysis, remoteload, utils;
    analysis = require('/static/har/analysis');
    utils = require('/static/utils');
    remoteload = function() {
      var each, i, len, ref;
      ref = [/\/har\/edit\/(\d+)/, /\/push\/\d+\/view/, /\/tpl\/\d+\/edit/];
      for (i = 0, len = ref.length; i < len; i++) {
        each = ref[i];
        if (location.pathname.match(each)) {
          return true;
        }
      }
      return false;
    };
    
    return angular.module('upload_ctrl', []).controller('UploadCtrl', function($scope, $rootScope, $http) {
      var element;
      element = angular.element('#upload-har');
      element.modal('show').on('hide.bs.modal', function() {
        return $scope.is_loaded != null;
      });

      element.find('input[type=file]').on('change', function(ev) {
        return $scope.file = this.files[0];
      });
      if (utils.storage.get('har_har') != null) {
        $scope.local_har = utils.storage.get('har_filename');
      }
      $scope.alert = function(message) {
        return element.find('.alert-danger').text(message).show();
      };
      $scope.loaded = function(loaded) {
        $scope.is_loaded = true;
        $rootScope.$emit('har-loaded', loaded);
        angular.element('#upload-har').modal('hide');
        return true;
      };
      $scope.load_remote = function(url) {
        element.find('button').button('loading');
        return $http.post(url).success(function(data, status, headers, config) {
          element.find('button').button('reset');
          return $scope.loaded(data);
        }).error(function(data, status, headers, config) {
          $scope.alert(data);
          return element.find('button').button('reset');
        });
      };
      if (!$scope.local_har && remoteload()) {
        $scope.load_remote(location.href);
      }
      $scope.load_file = function(data) {
        var each, i, len, loaded, ref;
        console.log(data);
        name = ""
        if (HARPATH != ""){
          name = HARNAME;
        }else{
          name = $scope.file.name;
        }
        if (data.log) {
          loaded = {
            filename: name,
            har: analysis.analyze(data, {
              username: $scope.username,
              password: $scope.password
            }),
            upload: true
          };
        } else {
          loaded = {
            filename: name,
            har: utils.tpl2har(data),
            upload: true
          };
        }
        loaded.env = {};
        ref = analysis.find_variables(loaded.har);
        for (i = 0, len = ref.length; i < len; i++) {
          each = ref[i];
          loaded.env[each] = "";
        }
        console.log(analysis.find_variables(loaded.har));
        return $scope.loaded(loaded);
      };
      $scope.load_local_har = function() {
        var loaded;
        loaded = {
          filename: utils.storage.get('har_filename'),
          har: utils.storage.get('har_har'),
          env: utils.storage.get('har_env'),
          upload: true
        };
        return $scope.loaded(loaded);
      };
      $scope.delete_local = function() {
        utils.storage.del('har_har');
        utils.storage.del('har_env');
        utils.storage.del('har_filename');
        $scope.local_har = void 0;
        if (!$scope.local_har && remoteload()) {
          return $scope.load_remote(location.href);
        }
      };
      
      if (HARPATH != ""){
        $.get(HARPATH,function(data,status){
          reader = new FileReader();
          $scope.load_file(angular.fromJson(data));
          return element.find('button').button('reset');
        });
      }
      else{
        return $scope.upload = function() {
          var reader;
          if ($scope.file == null) {
            $scope.alert('还没选择文件啊，亲');
            return false;
          }
          if ($scope.file.size > 50 * 1024 * 1024) {
            $scope.alert('文件大小超过50M');
            return false;
          }
          element.find('button').button('loading');
          reader = new FileReader();
          reader.onload = function(ev) {
            return $scope.$apply(function() {
              $scope.uploaded = true;
              $scope.load_file(angular.fromJson(ev.target.result));
              return element.find('button').button('reset');
            });
          };
          return reader.readAsText($scope.file);
        };
      }
    });
  });

}).call(this);
