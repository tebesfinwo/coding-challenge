
var results;

$(function() {
	
	$(document).on('submit', 'form.new-user-form', function(e){
		e.preventDefault();

		$('span.danger').remove(); //reset if there is any

		var self = $(this), 
			$name = self.find("[name='name']"), 
			$email = self.find("[name='email']"), 
			$phone = self.find("[name='phone']");	

		if ( ! $name.val() ) {
			$name.after( $('<span>', { text : 'Your name is missing', class: "danger" }) );
			return;
		} 

		if ( ! $email.val() ){
			$email.after( $('<span>', { text : 'Your email is missing', class: "danger" }) );
			return;
		} else {
			if ( ! validateEmail($email.val()) ) {
				$email.after( $('<span>', { text : 'Please enter a valid email address', class: "danger" }) );
				return;
			}
		}

		if ( ! $phone.val() ){
			$phone.after( $('<span>', { text : 'Your phone number is missing', class: "danger" }) );
			return;
		} else {
			if ( ! $phone.val().match(/\d/g).length === 10 ) {
				$phone.after( $('<span>', { text : 'Please enter a valid phone number', class: "danger" }) );
				return;
			}
		}

		$.post(self.attr('action'), self.serialize())
			.done(function(result){
				if (result.error) {
					self.before( $('<span>', { text : result.error, class: "danger" }) );
				} else {
					self.before( $('<span>', { text : result.success, class: "success" }) );
				}
			});

	});

	$(document).on('focus', '.new-user-form input', function(e){
		var $spans = $('span.danger');
		$spans.fadeOut('slow').remove();
	});
	
	$(document).on('submit', 'form.filter-form', function(e){
		
		e.preventDefault();

		$('span.danger').remove(); //clear all the message

		var self = $(this), 
			fromValue = self.find("[name='from']").val(), 
			toValue = self.find("[name='to']").val(), 
			genderValue = self.find("[name='gender']").val(), 
			stateValue = self.find("[name='state']").val();

			if ( !(fromValue && toValue && genderValue && stateValue) ) {
				self.before($('<span>', { text : "All of the fields are empty.", class: 'danger' }));
				return;
			}

			if ( fromValue || toValue ) {
				if ( fromValue > toValue ) {
					self.before($('<span>', { text: "Something is wrong with your value. Should be like this 12 - 75.", class: "danger"}));
					return;
				} 
			}

			$.post( self.attr('action'), self.serialize())
				.done(function(data){
					if ( data.error ) {
						alert(data.error)
					} else {
						var $tbody = $('main.users tbody');
						$tbody.empty();
						data.results.forEach(function(result){
							var $row = $("<tr>").data("sha1", result.user.sha1),
								$nameCol = $('<td>', { class: 'name', text: result.user.name.first + " " + result.user.name.last}),
								$ageCol = $('<td>', { class: 'age', text: result.user.age }),
								$emailCol = $('<td>', { class: 'email', text: result.user.email }),
								$phoneCol = $('<td>', { class: 'phone', text: result.user.phone }),
								$stateCol = $('<td>', { class: 'state', text: result.user.location.state });
							$row.append($nameCol, $ageCol, $emailCol, $phoneCol, $stateCol).appendTo($tbody);
						});
					}
				});
	});

	$(document).on('click', 'main.home a.new-user', function(e){
		e.preventDefault();
		var $modal = $('dialog.new-user-modal');
		$('body').addClass('overlay');
		$modal[0].show();
	});
		
	$(document).on('click', 'main.users td.name', function(e){
		e.preventDefault();
		var self = $(this), 
			$modal = $('dialog.users-modal'),
			sha1 = self.parent().data('sha1'), 
			user;

		for(var i = 0; i < results.length; i++){
			if ( results[i].user.sha1 === sha1 ) {
				user = results[i].user;
				break;
			}
		}
		$modal.find('.image').empty().append($('<img>', { src: user.picture.thumbnail, alt: "Ops" }));
		$modal.find('.name').text( "Name : " + user.name.first + " " + user.name.last);
		$modal.find('.age').text( "Age : " +user.age);
		$modal.find('.email').text( "Email : " + user.email)
		$modal.find('.phone').text( "Phone : " + user.phone);
		$modal.find('.state').text( "State : " + user.location.state);
		$('body').addClass('overlay');
		$modal[0].show();
	});

	$(document).on('click', '.modal', function(e){
		e.stopPropagation();
	});

	$(document).on('click', '.modal .close', function(e){
		$('dialog.modal')[0].close();
		$('body').removeClass('overlay');
	});

	$(document).on('click', 'th', function(){
	    var table = $(this).parents('table').eq(0)
	    var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
	    this.asc = !this.asc
	    if (!this.asc){rows = rows.reverse()}
	    for (var i = 0; i < rows.length; i++){
	    	table.append(rows[i])
	    }
	});

	function comparer(index) {
	    return function(a, b) {
	        var valA = getCellValue(a, index), valB = getCellValue(b, index)
	        return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB)
	    }
	}

	function getCellValue(row, index){ 
		return $(row).children('td').eq(index).html() 
	}

	function validateEmail(email) { 
	    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	} 

});

$(window).load(function(){
	if ( $('#users').length ){
		$.getJSON('/users', function(data){
			results = data.results;
		});
	}
});
