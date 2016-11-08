--
-- get how/what/why counts for today
--
CREATE OR REPLACE FUNCTION get_counts()
  RETURNS TABLE(hows BIGINT, whats BIGINT, whys BIGINT)
AS $$
BEGIN
  return QUERY VALUES ((SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.hows) from howwhatwhy where timestamp::date = current_date) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whats) from howwhatwhy where timestamp::date = current_date) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whys) from howwhatwhy where timestamp::date = current_date) as foo));
END; $$
LANGUAGE plpgsql;

--
-- get how/what/why counts for a specific date
--
CREATE OR REPLACE FUNCTION get_counts(
  in_date VARCHAR(10)
)
  RETURNS TABLE(hows BIGINT, whats BIGINT, whys BIGINT)
AS $$
DECLARE
  _date DATE := to_date(in_date, 'YYYY-MM-DD');
BEGIN
  return QUERY VALUES ((SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.hows) from howwhatwhy where _date=timestamp::date) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whats) from howwhatwhy where _date=timestamp::date) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whys) from howwhatwhy where _date=timestamp::date) as foo));
END; $$
LANGUAGE plpgsql;

--
-- get how/what/why counts for the last N days
--
CREATE OR REPLACE FUNCTION get_counts(
  in_days INTEGER
)
  RETURNS TABLE(hows BIGINT, whats BIGINT, whys BIGINT)
AS $$
DECLARE
  number_of_days INTERVAL := concat( in_days, ' days' );
BEGIN
  return QUERY VALUES ((SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.hows) from howwhatwhy where timestamp::date BETWEEN current_date-number_of_days and current_date) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whats) from howwhatwhy where timestamp::date BETWEEN current_date-number_of_days and current_date) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whys) from howwhatwhy where timestamp::date BETWEEN current_date-number_of_days and current_date) as foo));
END; $$
LANGUAGE plpgsql;

--
-- get the text and hrefs for today's links
--
CREATE OR REPLACE FUNCTION public.get_links()
  RETURNS TABLE(href VARCHAR(255), linktext VARCHAR(255))
AS $$
DECLARE
  _id INTEGER;
BEGIN
  for _id in
    SELECT DISTINCT unnest(hows) from howwhatwhy where timestamp::date = current_date
    UNION SELECT DISTINCT unnest(whats) from howwhatwhy where timestamp::date = current_date
    UNION SELECT DISTINCT unnest(whys) from howwhatwhy where timestamp::date = current_date
  LOOP
    href := (select links.href from links where links.id = _id);
    linktext := (select links.text from links where links.id = _id);
    RETURN NEXT;
  END LOOP;

END; $$
LANGUAGE plpgsql;

--
-- get the text and hrefs for the past N days' links
--
CREATE OR REPLACE FUNCTION public.get_links( in_days INTEGER )
  RETURNS TABLE(href VARCHAR(255), linktext VARCHAR(255))
AS $$
DECLARE
  _id INTEGER;
  number_of_days INTERVAL := concat( in_days, ' days' );
BEGIN
  for _id in
  SELECT DISTINCT unnest(hows) from howwhatwhy where timestamp::date BETWEEN current_date-number_of_days and current_date
  UNION SELECT DISTINCT unnest(whats) from howwhatwhy where timestamp::date BETWEEN current_date-number_of_days and current_date
  UNION SELECT DISTINCT unnest(whys) from howwhatwhy where timestamp::date BETWEEN current_date-number_of_days and current_date
  LOOP
    href := (select links.href from links where links.id = _id);
    linktext := (select links.text from links where links.id = _id);
    RETURN NEXT;
  END LOOP;

END; $$
LANGUAGE plpgsql;

--
-- get the text and hrefs for a specific day's links
--
CREATE OR REPLACE FUNCTION public.get_links( in_date VARCHAR(10) )
  RETURNS TABLE(href VARCHAR(255), linktext VARCHAR(255))
AS $$
DECLARE
  _date DATE := to_date(in_date, 'YYYY-MM-DD');
  _id INTEGER;
BEGIN
  for _id in
  SELECT DISTINCT unnest(hows) from howwhatwhy where timestamp::date = _date
  UNION SELECT DISTINCT unnest(whats) from howwhatwhy where timestamp::date = _date
  UNION SELECT DISTINCT unnest(whys) from howwhatwhy where timestamp::date = _date
  LOOP
    href := (select links.href from links where links.id = _id);
    linktext := (select links.text from links where links.id = _id);
    RETURN NEXT;
  END LOOP;

END; $$
LANGUAGE plpgsql;

-- how/what/why counts from today
-- SELECT get_counts();
-- how/what/why counts from the past ten days
-- SELECT get_counts(10);
-- how/what/counts from a specific day
-- SELECT get_counts('2016-10-17');

-- links from today
-- SELECT get_links();
-- links for the past ten days
-- SELECT get_links(10);
-- links from a specific day
-- SELECT get_links(get_link_ids_as_array('2016-10-17'));