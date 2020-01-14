var body = $('body');

window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.loadHidden = false;

document.addEventListener('lazyloaded', function (e) {
  'use strict';
  if ($(e.target).parent('.site-cover').length) {
    $(e.target).parent().addClass('initialized');
  }
});

$(function () {
  'use strict';
  gallery();
  player();
  pagination();
  popup();
  notification();
});

function gallery() {
  'use strict';
  var images = document.querySelectorAll('.kg-gallery-image img');

  images.forEach(function (image) {
    var container = image.closest('.kg-gallery-image');
    var width = image.attributes.width.value;
    var height = image.attributes.height.value;
    var ratio = width / height;
    container.style.flex = ratio + ' 1 0%';
  });
}

function player() {
  'use strict';
  var player = jQuery('.player');
  var playerAudio = jQuery('.player-audio');
  var playerMedia = player.find('.post-media');
  var playerThumbnail = player.find('.post-image');
  var playerTitle = player.find('.post-title-link');
  var playerMeta = player.find('.post-meta');
  var playerProgress = jQuery('.player-progress');
  var playerSpeed = 1;
  var buttonEpisode;
  var buttonPlay = jQuery('.player-button-play');
  var buttonBackward = jQuery('.player-button-backward');
  var buttonForward = jQuery('.player-button-forward');
  var buttonSpeed = jQuery('.player-button-speed');
  var buttonClose = jQuery('.player-button-close');
  var timeCurrent = jQuery('.player-time-current');
  var timeDuration = jQuery('.player-time-duration');

  jQuery('.site').on('click', '.js-play', function () {
    var clicked = jQuery(this);
    var url = clicked.attr('data-url');
    var id = clicked.attr('data-id');

    if (jQuery('.player-external').length) {
      body.addClass('player-opened');
    }

    if (id !== playerMedia.attr('data-id')) {
      // Change audio player url
      playerAudio.attr('src', url);

      // Change player thumbnail and call lazySizes
      playerThumbnail.attr('data-srcset', clicked.find('.post-image').attr('data-srcset'));
      lazySizes.loader.unveil(playerThumbnail[0]);

      // Change player title
      playerTitle.text(clicked.closest('.post').find('.post-title-link').text());

      // Change player meta
      playerMeta.html(clicked.closest('.post').find('.post-meta').html());

      // Make previous episode button pause
      jQuery('.post-' + playerMedia.attr('data-id')).find('.icon').removeClass('icon-pause');

      // Change player media id attribute
      playerMedia.attr('data-id', id);
      buttonPlay.attr('data-id', id);

      // Select current episode button
      buttonEpisode = jQuery('[data-id="' + id + '"]').find('.icon-play');
    }

    if (playerAudio[0].paused) {
      var playPromise = playerAudio[0].play();
      if (playPromise !== undefined) {
        playPromise.then(function () {
          // Make clicked button pause
          clicked.find('.icon').addClass('icon-pause');
          // Make playing episode button pause
          if (buttonEpisode) {
            buttonEpisode.addClass('icon-pause');
          }
        }).catch(function (error) {
          console.log(error);
        })
      }
    } else {
      playerAudio[0].pause();
      // Make clicked button play
      clicked.find('.icon').removeClass('icon-pause');
      // Make paused episode button play
      if (buttonEpisode) {
        buttonEpisode.removeClass('icon-pause');
      }
    }
  });

  playerAudio.on('loadedmetadata', function () {
    timeDuration.text(new Date(playerAudio[0].duration * 1000).toISOString().substr(11, 8));
    playerAudio[0].addEventListener('timeupdate', function (e) {
      timeCurrent.text(new Date(e.target.currentTime * 1000).toISOString().substr(11, 8));
      playerProgress.css('width', e.target.currentTime / playerAudio[0].duration * 100 + '%');
    })
  });

  buttonBackward.on('click', function () {
    playerAudio[0].currentTime = playerAudio[0].currentTime - 10;
  });

  buttonForward.on('click', function () {
    playerAudio[0].currentTime = playerAudio[0].currentTime + 30;
  });

  buttonSpeed.on('click', function () {
    if (playerSpeed < 2) {
      playerSpeed += 0.5;
    } else {
      playerSpeed = 1;
    }

    playerAudio[0].playbackRate = playerSpeed;
    buttonSpeed.text(playerSpeed + 'x');
  });
}

function pagination() {
  'use strict';
  var wrapper = $('.post-feed');

  if (body.hasClass('paged-next')) {
    wrapper.infiniteScroll({
      append: '.post',
      button: '.infinite-scroll-button',
      debug: false,
      hideNav: '.pagination',
      path: '.pagination .older-posts',
      scrollThreshold: false,
      status: '.infinite-scroll-status',
    });
  }
}

function popup() {
  'use strict';
  jQuery('.js-popup').on('click', function () {
    jQuery(this).parent().toggleClass('popup-opened');
  });
}

function notification() {
  'use strict';
  $('.notification-close').on('click', function (e) {
    e.preventDefault();

    body.removeClass('notification-opened');
    var uri = window.location.toString();
    if (uri.indexOf('?') > 0) {
      var clean_uri = uri.substring(0, uri.indexOf('?'));
      window.history.replaceState({}, document.title, clean_uri);
    }

    if ($(this).closest('.subscribe-form').length) {
      $(this).closest('.subscribe-form').removeClass('success error');
    }
  });
}

function getParameterByName(name, url) {
  'use strict';
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  var results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}