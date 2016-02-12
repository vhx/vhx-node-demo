'use strict';

$(function() {
  var self = this;

  self.init = function() {
    self.bindModals();
  };

  self.bindModals = function() {
    $('[data-modal-open]').on('click', function(event) {
      var name = $(this).data('modal-open');

      event.preventDefault();

      self.openModal(name);

    });

    $('.modal--bg').on('click', function(event){
      event.preventDefault();
      self.closeModals();
    });

    $('[data-modal-close]').on('click', function(event){
      event.preventDefault();
      self.closeModals();
    });
  };

  self.openModal = function(name) {
    var modal = $('[data-component="modal-' + name + '"]');

    if (!modal.hasClass('is-active')) {
      modal.addClass('is-active');
    }
  };

  self.closeModals = function() {
    var modal = $('.modal--container');

    if (modal.hasClass('is-active')) {
      modal.removeClass('is-active');
    }
  };

  self.init();
});
