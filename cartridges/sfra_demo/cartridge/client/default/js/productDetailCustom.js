'use strict';
var base = require('base/product/base');
var jsPDF = require('jsPDF')
var html2canvas = require('html2canvas')

function updateAvailability(e, response) {
	var availabilityValue = '';
	var availabilityMessages = response.product.ats.messages;
	if (!response.product.readyToOrder) {
	    availabilityValue = '<li><div>' + response.resources.info_selectforstock + '</div></li>';
	} else {
	    availabilityMessages.forEach(function (message) {
	        availabilityValue += '<li><div>' + message + '</div></li>';
	    });
	}

	$('div.availability', response.$productContainer)
	    .data('ready-to-order', response.product.readyToOrder)
	    .data('available', response.product.available);

	$('.availability-msg', response.$productContainer)
	    .empty().html(availabilityValue);

	if ($('.global-availability').length) {
	    var allAvailable = $('.product-availability').toArray()
	        .every(function (item) { return $(item).data('available'); });

	    var allReady = $('.product-availability').toArray()
	        .every(function (item) { return $(item).data('ready-to-order'); });

	    $('.global-availability')
	        .data('ready-to-order', allReady)
	        .data('available', allAvailable);

	    $('.global-availability .availability-msg').empty()
	        .html(allReady ? response.message : response.resources.info_selectforstock);
	}

	if(response.product.ats.messages.length > 0) {
		$('.add-btn-wrapper .add-to-cart').css('display', 'inline');
		$('.add-btn-wrapper .select-styles-btn').css('display', 'none');
	} else {
		$('.add-btn-wrapper .add-to-cart').css('display', 'none');
		$('.add-btn-wrapper .select-styles-btn').css('display', 'inline');
	}
	
}

// 产品详情页面滚动事件执行逻辑
function productPageScroll () {
	var $pdh = $('.product-detail-header');
	var fixedHeight = $('#maincontent').offset().top;
	if($(window).scrollTop() > fixedHeight) {
		if($pdh.css('display') !== 'none') {
			return;
		}
		$pdh.css('display', 'flex');
		$pdh.css('margin-top', 0 - fixedHeight);
		$('.add-btn-wrapper .add-to-cart').removeAttr('disabled');
		$('.add-btn-wrapper .select-styles-btn').on('click', function() {
			$(window).scrollTop($('.attributes').offset().top);
		});
	} else {
		$pdh.css('display', 'none');
	}
}

// 生成PDF文件
function generatePDF () {
	$.spinner().start();
	var copyDom = $('.product-detail');
	var width = copyDom.outerWidth(true);
	var height = copyDom.outerHeight(true);
	html2canvas(document.querySelector('.product-detail'), {
		dpi: 300,
		scale: 2,
		width: width,
		height: height,
		logging: true,
	}).then((canvas) => {
		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const imgProps = pdf.getImageProperties(imgData);
		const pdfHeight = imgProps.height * pdfWidth / imgProps.width;
		pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
		const fileName = $('.generate-pdf').attr('name') + '.pdf';
		pdf.save(fileName);
	}).finally(() => {
		$.spinner().stop();
	});
}

$(document).ready(function () {
    $('body').off('product:updateAvailability').on('product:updateAvailability', updateAvailability);
	$('.generate-pdf').on('click', generatePDF);
	$(window).on('scroll', productPageScroll);
	$(window).trigger('scroll');
    base.updateAvailability = updateAvailability;
    module.exports = base;
});