function SpotifyController(){}

SpotifyController.prototype.searchQuery = function () {
  $('#custom-search-input').submit(this.searchArtist.bind(this))
}

SpotifyController.prototype.searchArtist = function (event) {
  event.preventDefault();
  $('#results').empty();
  var query = "q=" + $('.search-query').val().replace(" ", "+") + "&type=artist"
  var getUrl = "https://api.spotify.com/v1/search"
  $.ajax({
    type: "GET",
    data: query,
    url: getUrl,
    success: this.showArtists,
    error: this.handleError
  });
}

SpotifyController.prototype.showArtists = function (response) {
  response.artists.items.forEach(function(artist) {
    var image = artist.images.length > 0 ? artist.images[1].url : "no-image.png"
    var artistHtml = `
      <div class="col-lg-3 col-md-4 col-sm-6 col-xs-12 artist">
        <div class="artist-name row">
          <h3>${ artist.name }</h3>
        </div>
        <div class="artist-picture row">
          <img src="${ image }" id="${ artist.id }">
        </div>
      </div>
    `;
    $('#results').append($(artistHtml));
  });

  $('.search-query').val("");
}

SpotifyController.prototype.selectArtist = function () {
  $(document).on('click', '.artist img', this.searchAlbums.bind(this))
}

SpotifyController.prototype.searchAlbums = function (event) {
  var artistId = $( event.currentTarget ).attr('id');
  var getUrl = "https://api.spotify.com/v1/artists/" + artistId + "/albums";
  $.ajax({
    type: "GET",
    url: getUrl,
    success: this.showAlbums,
    error: this.handleError
  });
}

SpotifyController.prototype.showAlbums = function (response) {
  response.items.forEach(function(album, index) {
    var image = album.images.length > 0 ? album.images[0].url : "no-image.png"
    var position = (index + 1) % 3 === 0 ? "left" : "right"
    var albumHtml = `
      <div class="col-md-4 album">
          <img src="${ image }" data-toggle="popover" data-placement="${ position }" title="${ album.name }" id="${ album.id }">
      </div>
    `;
    $('.modal-content').append($(albumHtml));
    $('#albumsModal').modal('show');
    $('[data-toggle="popover"]').popover()
    $('[data-toggle="popover"]').on('click', function (e) {
        $('[data-toggle="popover"]').not(this).popover('hide');
    });
  });
}

SpotifyController.prototype.closeAlbums = function () {
  $('#albumsModal').on('hidden.bs.modal', function() {
    $('.modal-content').empty();
  });
}

SpotifyController.prototype.selectAlbum = function () {
  $(document).on('click', '.album img', this.searchTracks.bind(this))
}

SpotifyController.prototype.searchTracks = function (event) {
  var albumId = $( event.currentTarget ).attr('id');
  var getUrl = "https://api.spotify.com/v1/albums/" + albumId + "/tracks";
  $.ajax({
    type: "GET",
    url: getUrl,
    success: this.showTraks,
    error: this.handleError
  });
}

SpotifyController.prototype.showTraks = function (response) {
  $('.popover-content').append('<div class="list-group">');
  response.items.forEach(function(track) {
    var duration = `${ ((track.duration_ms /1000/60) << 0) }:${ Math.floor((track.duration_ms /1000) % 60) }`
    var trackHtml = `
        <a href="${ track.preview_url }" target="_blank" class="list-group-item">
          ${ track.track_number } - ${ track.name } (${ duration })
        </a>
    `
    $('.popover-content div').append(trackHtml)
  });
}

SpotifyController.prototype.closeTracks = function () {
  $('[data-toggle="popover"]').on('hidden.bs.popover', function (e) {
    $('[data-toggle="popover"]').empty();
  });
}

SpotifyController.prototype.listen = function () {
  this.searchQuery();
  this.selectArtist();
  this.closeAlbums();
  this.selectAlbum();
  this.closeTracks();
}

SpotifyController.prototype.handleError = function (error) {
  alert("ERROR!\n" + error);
}

var spotifyController = new SpotifyController();
spotifyController.listen();

