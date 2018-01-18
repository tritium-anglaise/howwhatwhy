--
-- get how/what/why counts for the given month
--
CREATE OR REPLACE FUNCTION get_counts(
  in_month INTEGER
)
  RETURNS TABLE(hows BIGINT, whats BIGINT, whys BIGINT)
AS $$
BEGIN
  return QUERY VALUES ((SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.hows) from howwhatwhy where date_part('month', timestamp) = in_month) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whats) from howwhatwhy where date_part('month', timestamp) = in_month) as foo),
                       (SELECT count(*) from (SELECT DISTINCT unnest(howwhatwhy.whys) from howwhatwhy where date_part('month', timestamp) = in_month) as foo));
END; $$
LANGUAGE plpgsql;

--
-- get the text and hrefs for the past N days' links
--
CREATE OR REPLACE FUNCTION public.get_links( in_month INTEGER )
  RETURNS TABLE(href VARCHAR(255), id INT, linktext VARCHAR(255))
AS $$
DECLARE
  _id INTEGER;
BEGIN
  for _id in
  SELECT DISTINCT unnest(hows) from howwhatwhy where date_part('month', timestamp) = in_month
  UNION SELECT DISTINCT unnest(whats) from howwhatwhy where date_part('month', timestamp) = in_month
  UNION SELECT DISTINCT unnest(whys) from howwhatwhy where date_part('month', timestamp) = in_month
  LOOP
    href := (select links.href from links where links.id = _id);
    id := _id;
    linktext := (select links.text from links where links.id = _id);
    RETURN NEXT;
  END LOOP;

END; $$
LANGUAGE plpgsql;
