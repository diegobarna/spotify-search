function Artists(){}
function Albums(){}
function Tracks(){}

function SpotifyController () {
  this.artists = new Artists();
  this.albums = new Albums();
  this.tracks = new Tracks();
}

Artists.prototype.searchQuery = function () {
  $('#custom-search-input').submit(this.searchArtist.bind(this))
}

Artists.prototype.searchArtist = function (event) {
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

Artists.prototype.showArtists = function (response) {
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

Albums.prototype.selectArtist = function () {
  $(document).on('click', '.artist img', this.searchAlbums.bind(this))
}

Albums.prototype.searchAlbums = function (event) {
  var artistId = $( event.currentTarget ).attr('id');
  var getUrl = "https://api.spotify.com/v1/artists/" + artistId + "/albums";
  $.ajax({
    type: "GET",
    url: getUrl,
    success: this.showAlbums,
    error: this.handleError
  });
}

Albums.prototype.showAlbums = function (response) {
  response.items.forEach(function(album, index) {
    var image = album.images.length > 0 ? album.images[0].url : "no-image.png"
    if (window.matchMedia("(min-width: 768px)").matches) {
      var position = (index + 1) % 3 === 0 ? "left" : "right"
    } else {
      var position = "bottom"
    }

    var albumHtml = `
      <div class="col-md-4 col-xs-12 album">
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

Albums.prototype.closeAlbums = function () {
  $('#albumsModal').on('hidden.bs.modal', function() {
    $('.modal-content').empty();
  });
}

Tracks.prototype.selectAlbum = function () {
  $(document).on('click', '.album img', this.searchTracks.bind(this))
}

Tracks.prototype.searchTracks = function (event) {
  console.log(this)
  var albumId = $( event.currentTarget ).attr('id');
  var getUrl = "https://api.spotify.com/v1/albums/" + albumId + "/tracks";
  $.ajax({
    type: "GET",
    url: getUrl,
    success: this.showTracks,
    error: this.handleError
  });
}

Tracks.prototype.showTracks = function (response) {
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

Tracks.prototype.closeTracks = function () {
  $('[data-toggle="popover"]').on('hidden.bs.popover', function (e) {
    $('[data-toggle="popover"]').empty();
  });
}

SpotifyController.prototype.listen = function () {
  this.artists.searchQuery();
  this.albums.selectArtist();
  this.albums.closeAlbums();
  this.tracks.selectAlbum();
  this.tracks.closeTracks();
}

SpotifyController.prototype.handleError = function (error) {
  alert("ERROR!\n" + error);
}

var spotifyController = new SpotifyController();
spotifyController.listen();

