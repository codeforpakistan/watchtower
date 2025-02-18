CREATE TABLE public.websites (
	id serial4 NOT NULL,
	"name" varchar(255) NOT NULL,
	url text NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	CONSTRAINT websites_pkey PRIMARY KEY (id),
	CONSTRAINT websites_url_key UNIQUE (url)
);
CREATE TABLE public.website_stats (
	id serial4 NOT NULL,
	website_id int4 NULL,
	stats jsonb NOT NULL,
	fetched_at timestamp DEFAULT now() NULL,
	CONSTRAINT website_stats_pkey PRIMARY KEY (id),
	CONSTRAINT website_stats_website_id_fkey FOREIGN KEY (website_id) REFERENCES public.websites(id)
);