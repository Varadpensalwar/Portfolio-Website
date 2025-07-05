if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
	  navigator.serviceWorker.register('/sw.js')
		.then(registration => {
		  console.log('Service Worker registered with scope:', registration.scope);
		})
		.catch(error => {
		  console.log('Service Worker registration failed:', error);
		});
	});
  }

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$sidebar = $('#sidebar');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Hack: Enable IE flexbox workarounds.
		if (browser.name == 'ie')
			$body.addClass('is-ie');

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Forms.

		// Hack: Activate non-input submits.
			$('form').on('click', '.submit', function(event) {

				// Stop propagation, default.
					event.stopPropagation();
					event.preventDefault();

				// Submit form.
					$(this).parents('form').submit();

			});

	// Sidebar.
		if ($sidebar.length > 0) {

			var $sidebar_a = $sidebar.find('a');

			$sidebar_a
				.addClass('scrolly')
				.on('click', function() {

					var $this = $(this);

					// External link? Bail.
						if ($this.attr('href').charAt(0) != '#')
							return;

					// Deactivate all links.
						$sidebar_a.removeClass('active');

					// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
						$this
							.addClass('active')
							.addClass('active-locked');

				})
				.each(function() {

					var	$this = $(this),
						id = $this.attr('href'),
						$section = $(id);

					// No section for this link? Bail.
						if ($section.length < 1)
							return;

					// Scrollex.
						$section.scrollex({
							mode: 'middle',
							top: '-20vh',
							bottom: '-20vh',
							initialize: function() {

								// Deactivate section.
									$section.addClass('inactive');

							},
							enter: function() {

								// Activate section.
									$section.removeClass('inactive');

								// No locked links? Deactivate all links and activate this section's one.
									if ($sidebar_a.filter('.active-locked').length == 0) {

										$sidebar_a.removeClass('active');
										$this.addClass('active');

									}

								// Otherwise, if this section's link is the one that's locked, unlock it.
									else if ($this.hasClass('active-locked'))
										$this.removeClass('active-locked');

							}
						});

				});

		}

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000,
			offset: function() {

				// If <=large, >small, and sidebar is present, use its height as the offset.
					if (breakpoints.active('<=large')
					&&	!breakpoints.active('<=small')
					&&	$sidebar.length > 0)
						return $sidebar.height();

				return 0;

			}
		});

	// Spotlights.
		$('.spotlights > section')
			.scrollex({
				mode: 'middle',
				top: '-10vh',
				bottom: '-10vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			})
			.each(function() {

				var	$this = $(this),
					$image = $this.find('.image'),
					$img = $image.find('img'),
					x;

				// Assign image.
					$image.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set background position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide <img>.
					$img.hide();

			});

	// Features.
		$('.features')
			.scrollex({
				mode: 'middle',
				top: '-20vh',
				bottom: '-20vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			});

})(jQuery);

// Header scroll behavior
$(document).ready(function() {
	var $header = $('#header');
	var lastScrollTop = 0;
	var scrollThreshold = 50; // Reduced threshold for better responsiveness
	
	$(window).scroll(function() {
		var scrollTop = $(this).scrollTop();
		
		// Hide/show header based on scroll direction
		if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
			if (scrollTop > lastScrollTop && scrollTop > 150) {
				// Scrolling down - hide header
				$header.addClass('scrolled');
			} else {
				// Scrolling up - show header
				$header.removeClass('scrolled');
			}
			lastScrollTop = scrollTop;
		}
	});
	
	// Show header when at top of page
	$(window).scroll(function() {
		if ($(this).scrollTop() < 100) {
			$header.removeClass('scrolled');
		}
	});
});

// --- Custom Space Background: Stars, Asteroids, Planets ---
(function() {
	const canvas = document.getElementById('particles-bg');
	if (!canvas) return;
	const ctx = canvas.getContext('2d');

	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resize();
	window.addEventListener('resize', resize);

	// Star particles
	const STAR_COUNT = 80;
	const ASTEROID_COUNT = 4;
	const PLANET_COUNT = 2;
	const stars = [];
	const asteroids = [];
	const planets = [];

	// Helper: random between a and b
	function rand(a, b) { return a + Math.random() * (b - a); }

	// Star: tiny, twinkling
	for (let i = 0; i < STAR_COUNT; i++) {
		stars.push({
			x: rand(0, canvas.width),
			y: rand(0, canvas.height),
			r: rand(0.5, 1.7),
			vx: rand(-0.08, 0.08),
			vy: rand(-0.08, 0.08),
			alpha: rand(0.5, 1),
			phase: rand(0, Math.PI * 2)
		});
	}

	// Asteroid: small, irregular, rocky
	for (let i = 0; i < ASTEROID_COUNT; i++) {
		const points = [];
		const cx = rand(0, canvas.width), cy = rand(0, canvas.height);
		const baseR = rand(10, 18);
		const n = Math.floor(rand(7, 10));
		for (let j = 0; j < n; j++) {
			const angle = (j / n) * Math.PI * 2;
			const r = baseR * rand(0.7, 1.2);
			points.push({
				x: Math.cos(angle) * r,
				y: Math.sin(angle) * r
			});
		}
		asteroids.push({
			cx,
			cy,
			vx: rand(-0.3, 0.3),
			vy: rand(-0.3, 0.3),
			rot: rand(0, Math.PI * 2),
			vr: rand(-0.01, 0.01),
			points,
			color: '#888',
			shadow: true
		});
	}

	// Planets/comets: small, colored, some with tails
	const planetColors = ['#4facfe', '#f093fb', '#f5576c', '#00d4ff'];
	for (let i = 0; i < PLANET_COUNT; i++) {
		const hasTail = Math.random() > 0.5;
		planets.push({
			x: rand(0, canvas.width),
			y: rand(0, canvas.height),
			r: rand(6, 12),
			vx: rand(-0.18, 0.18),
			vy: rand(-0.18, 0.18),
			color: planetColors[Math.floor(rand(0, planetColors.length))],
			hasTail,
			tailAlpha: rand(0.2, 0.5)
		});
	}

	function bounce(obj) {
		if (obj.x - obj.r < 0) { obj.x = obj.r; obj.vx *= -1; }
		if (obj.x + obj.r > canvas.width) { obj.x = canvas.width - obj.r; obj.vx *= -1; }
		if (obj.y - obj.r < 0) { obj.y = obj.r; obj.vy *= -1; }
		if (obj.y + obj.r > canvas.height) { obj.y = canvas.height - obj.r; obj.vy *= -1; }
	}

	function asteroidBounce(a) {
		const minX = Math.min(...a.points.map(p => p.x)) + a.cx;
		const maxX = Math.max(...a.points.map(p => p.x)) + a.cx;
		const minY = Math.min(...a.points.map(p => p.y)) + a.cy;
		const maxY = Math.max(...a.points.map(p => p.y)) + a.cy;
		if (minX < 0) { a.cx += (0 - minX); a.vx *= -1; }
		if (maxX > canvas.width) { a.cx -= (maxX - canvas.width); a.vx *= -1; }
		if (minY < 0) { a.cy += (0 - minY); a.vy *= -1; }
		if (maxY > canvas.height) { a.cy -= (maxY - canvas.height); a.vy *= -1; }
	}

	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw stars
		for (const s of stars) {
			s.x += s.vx;
			s.y += s.vy;
			if (s.x < 0) s.x = canvas.width;
			if (s.x > canvas.width) s.x = 0;
			if (s.y < 0) s.y = canvas.height;
			if (s.y > canvas.height) s.y = 0;
			s.phase += 0.03;
			const twinkle = 0.5 + 0.5 * Math.sin(s.phase);
			ctx.save();
			ctx.globalAlpha = s.alpha * twinkle;
			ctx.beginPath();
			ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
			ctx.fillStyle = '#fff';
			ctx.shadowColor = '#fff';
			ctx.shadowBlur = 8;
			ctx.fill();
			ctx.restore();
		}

		// Draw asteroids
		for (const a of asteroids) {
			a.cx += a.vx;
			a.cy += a.vy;
			a.rot += a.vr;
			asteroidBounce(a);
			ctx.save();
			ctx.translate(a.cx, a.cy);
			ctx.rotate(a.rot);
			ctx.beginPath();
			for (let i = 0; i < a.points.length; i++) {
				const p = a.points[i];
				if (i === 0) ctx.moveTo(p.x, p.y);
				else ctx.lineTo(p.x, p.y);
			}
			ctx.closePath();
			ctx.fillStyle = a.color;
			ctx.globalAlpha = 0.85;
			if (a.shadow) {
				ctx.shadowColor = '#222';
				ctx.shadowBlur = 12;
			}
			ctx.fill();
			ctx.restore();
		}

		// Draw planets/comets
		for (const p of planets) {
			p.x += p.vx;
			p.y += p.vy;
			bounce(p);
			ctx.save();
			if (p.hasTail) {
				ctx.globalAlpha = p.tailAlpha;
				ctx.beginPath();
				ctx.ellipse(p.x - p.vx*12, p.y - p.vy*12, p.r*1.5, p.r*0.5, Math.atan2(p.vy, p.vx), 0, Math.PI*2);
				ctx.fillStyle = p.color;
				ctx.fill();
				ctx.globalAlpha = 1;
			}
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
			ctx.fillStyle = p.color;
			ctx.shadowColor = p.color;
			ctx.shadowBlur = 16;
			ctx.fill();
			ctx.restore();
		}
		requestAnimationFrame(draw);
	}
	draw();
})();
// --- End Custom Space Background ---