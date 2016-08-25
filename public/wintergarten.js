'use strict';

$(function() {
  var self = this;

  self.init = function() {
    self.fetchRows();
    self.bindModals();
    self.bindForms();
  };

  self.fetchRows = function() {
    $('[data-id]').each(function() {
      var el =  $(this);
      (function(el){
        $.ajax({
          url: 'items.json?id=' + el.data('id'),
          method: 'GET'
        }).done(function(data) {
          $('[data-id=' + data.id +']').html(data.partial);
        });
      })(el);
    });
  };

  self.bindForms = function() {
    $('form').on('submit', function() {
      $(this).find('button').addClass('is-processing');
    });
  };

  self.bindModals = function() {
    $(document).on('click', '[data-modal-open]', function(event) {
      var name = $(this).data('modal-open');
      var redirect = self.getRedirect($(this));

      event.preventDefault();

      self.openModal(name, redirect);

    });

    $('.modal--bg').on('click', function(event){
      event.preventDefault();
      self.closeModals();
    });

    $('[data-modal-close]').on('click', function(event){
      event.preventDefault();
      self.closeModals();
    });

    $(window).on('resize', function() {
      var modals = $('.modal--container.is-active');
      if (modals.length) {
        modals.css('top', $(window).scrollTop());
      }
    });
  };

  self.openModal = function(name, redirect) {
    var modal = $('[data-component="modal-' + name + '"]');
    var form = modal.find('form');

    if (redirect.indexOf('watch') >= 0 && form.length) {
      form.append('<input type="hidden" name="redirect" value="' + redirect + '">');
    }
    if (!modal.hasClass('is-active')) {
      modal.css('top', $(window).scrollTop());
      modal.addClass('is-active');
    }
  };

  self.closeModals = function() {
    var modal = $('.modal--container');
    var form = modal.find('form');

    if (form.length) {
      form.find('[name=redirect]').remove();
    }
    if (modal.hasClass('is-active')) {
      modal.removeClass('is-active');
    }
  };

  self.getRedirect = function(el) {
    var parser = document.createElement('a');
    parser.href = el.prop('href');

    return parser.pathname;
  };

  self.init();
});
