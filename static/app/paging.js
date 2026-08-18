function Pager(tableName, itemsPerPage) {
  this.tableName = tableName;
  this.itemsPerPage = itemsPerPage;
  this.currentPage = 1;
  this.pages = 0;
  this.inited = false;
  this.pagerName = '';
  this.positionId = '';

  this.showRecords = function (from, to) {
    var rows = document.getElementById(tableName).rows;
    // i starts from 1 to skip table header row
    for (var i = 1; i < rows.length; i++) {
      if (i < from || i > to) rows[i].style.display = "none";
      else rows[i].style.display = "";
    }
  };

  this.showPage = function (pageNumber) {
    if (!this.inited) {
      alert("not inited");
      return;
    }

    this.currentPage = pageNumber;

    var from = (pageNumber - 1) * itemsPerPage + 1;
    var to = from + itemsPerPage - 1;
    this.showRecords(from, to);

    // Re-render pagination to update active state and visible pages
    this.renderPageNav();
  };

  this.prev = function () {
    if (this.currentPage > 1) this.showPage(this.currentPage - 1);
  };

  this.next = function () {
    if (this.currentPage < this.pages) {
      this.showPage(this.currentPage + 1);
    }
  };

  this.init = function () {
    var rows = document.getElementById(tableName).rows;
    var records = rows.length;
    this.pages = Math.ceil(records / itemsPerPage);
    this.inited = true;
  };

  this.showPageNav = function (pagerName, positionId) {
    if (!this.inited) {
      alert("not inited");
      return;
    }
    this.pagerName = pagerName;
    this.positionId = positionId;
    this.renderPageNav();
  };

  this.renderPageNav = function () {
    var element = document.getElementById(this.positionId);
    var pagerName = this.pagerName;
    var currentPage = this.currentPage;
    var totalPages = this.pages;

    // Determine which pages to show
    // Always show: first page, last page, current page, and 1-2 pages around current
    var pagesToShow = [];
    var maxVisiblePages = 7; // Maximum page numbers to show (excluding prev/next)

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (var i = 1; i <= totalPages; i++) {
        pagesToShow.push(i);
      }
    } else {
      // Always include first page
      pagesToShow.push(1);

      // Calculate range around current page
      var startRange = Math.max(2, currentPage - 1);
      var endRange = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to show more pages if near start or end
      if (currentPage <= 3) {
        endRange = Math.min(totalPages - 1, 4);
      }
      if (currentPage >= totalPages - 2) {
        startRange = Math.max(2, totalPages - 3);
      }

      // Add ellipsis before range if needed
      if (startRange > 2) {
        pagesToShow.push('...');
      }

      // Add range pages
      for (var i = startRange; i <= endRange; i++) {
        pagesToShow.push(i);
      }

      // Add ellipsis after range if needed
      if (endRange < totalPages - 1) {
        pagesToShow.push('...');
      }

      // Always include last page
      if (totalPages > 1) {
        pagesToShow.push(totalPages);
      }
    }

    // Build HTML
    var pagerHtml = '<div class="pagination-wrapper">';

    // Prev button
    var prevDisabled = currentPage === 1 ? ' pg-disabled' : '';
    pagerHtml += '<span onclick="' + pagerName + '.prev();" class="pg-normal pg-nav' + prevDisabled + '">&#171; Prev</span>';

    // Page numbers
    for (var i = 0; i < pagesToShow.length; i++) {
      var page = pagesToShow[i];
      if (page === '...') {
        pagerHtml += '<span class="pg-ellipsis">...</span>';
      } else {
        var selectedClass = page === currentPage ? 'pg-selected' : 'pg-normal';
        pagerHtml += '<span id="pg' + page + '" class="' + selectedClass + '" onclick="' + pagerName + '.showPage(' + page + ');">' + page + '</span>';
      }
    }

    // Next button
    var nextDisabled = currentPage === totalPages ? ' pg-disabled' : '';
    pagerHtml += '<span onclick="' + pagerName + '.next();" class="pg-normal pg-nav' + nextDisabled + '">Next &#187;</span>';

    pagerHtml += '</div>';

    element.innerHTML = pagerHtml;
  };
}
