-- Дата релиза задаётся в планировании (расчёт), не при создании карточки

alter table releases
  alter column release_date drop not null;
