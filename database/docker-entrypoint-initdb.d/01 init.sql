GRANT ALL PRIVILEGES ON DATABASE pfila TO pfila;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

-- ROLE
CREATE TABLE public.role (
    id integer NOT NULL,
    name character varying NOT NULL
);
ALTER TABLE public.role OWNER TO pfila;
CREATE SEQUENCE public.role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.role_id_seq OWNER TO pfila;
ALTER SEQUENCE public.role_id_seq OWNED BY public.role.id;

-- USER
CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying,
    name character varying NOT NULL,
    prename character varying NOT NULL
);
ALTER TABLE public."user" OWNER TO pfila;
CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER TABLE public.user_id_seq OWNER TO pfila;
ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;

-- USER_ROLES_ROLE
CREATE TABLE public.user_roles_role (
    "userId" integer NOT NULL,
    "roleId" integer NOT NULL
);
ALTER TABLE public.user_roles_role OWNER TO pfila;

ALTER TABLE ONLY public.role ALTER COLUMN id SET DEFAULT nextval('public.role_id_seq'::regclass);
ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);

COPY public.role (id, name) FROM stdin;
1	admin
2	guest
\.

COPY public."user" (id, email, password, firstname, lastname) FROM stdin;
1	david.leuenberger@gmx.ch	$2a$10$mjKioWUv74sKmpJRwf.PVO8kdPnlKcYqk2XSpkq5flZcAtCZPuo8G	David	Leuenberger
\.

COPY public.user_roles_role ("userId", "roleId") FROM stdin;
1	1
\.

SELECT pg_catalog.setval('public.role_id_seq', 2, true);
SELECT pg_catalog.setval('public.user_id_seq', 1, true);
ALTER TABLE ONLY public.role
    ADD CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY (id);
ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId");
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);
ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);
CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON public.user_roles_role USING btree ("roleId");
CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON public.user_roles_role USING btree ("userId");
ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES public.role(id);
ALTER TABLE ONLY public.user_roles_role
    ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;
