-- Run after 001_sermon_content_and_drafts.sql.
-- Security-definer functions keep draft writes behind authenticated role checks.
create or replace function public.save_ai_draft(p_task_id uuid, p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_task public.tasks%rowtype; v_agent public.agents%rowtype; v_id uuid;
begin
 if not public.has_role(array['admin','manager']::text[]) then raise exception 'Not authorized'; end if;
 if length(trim(p_body)) = 0 or length(p_body) > 30000 then raise exception 'Invalid draft length'; end if;
 select * into v_task from public.tasks where id=p_task_id;
 if not found or v_task.assignee_type <> 'agent' or v_task.assignee_agent_id is null then raise exception 'Invalid agent assignment'; end if;
 select * into v_agent from public.agents where id=v_task.assignee_agent_id;
 if not found or not v_agent.enabled or v_agent.name <> 'Jordan Hayes' then raise exception 'Agent not supported'; end if;
 insert into public.generated_drafts (sermon_id,task_id,agent_id,content_type,body,status,updated_at)
 values (v_task.sermon_id,v_task.id,v_agent.id,'youtube_description',p_body,'review',now())
 on conflict (task_id) do update set body=excluded.body,status='review',updated_at=now()
 returning id into v_id;
 return v_id;
end $$;
revoke all on function public.save_ai_draft(uuid,text) from public,anon;
grant execute on function public.save_ai_draft(uuid,text) to authenticated;

create or replace function public.review_ai_draft(p_task_id uuid,p_decision text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_draft public.generated_drafts%rowtype;
begin
 if not public.has_role(array['admin','manager']::text[]) then raise exception 'Not authorized'; end if;
 if p_decision not in ('approved','revision_requested') then raise exception 'Invalid decision'; end if;
 select * into v_draft from public.generated_drafts where task_id=p_task_id;
 if not found then raise exception 'Draft not found'; end if;
 update public.generated_drafts set status=p_decision,updated_at=now() where id=v_draft.id;
end $$;
revoke all on function public.review_ai_draft(uuid,text) from public,anon;
grant execute on function public.review_ai_draft(uuid,text) to authenticated;
