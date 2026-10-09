import type { CalendarEvent, InboxItem, Job } from './types';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const EXPIRED_TEXT = /(?:报名|投递|网申)?已截止|报名截止|活动已结束|招聘已结束|现阶段投递已结束/;

export function localTodayIso(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function hasPassedDate(date: string, today = localTodayIso()) {
  return ISO_DATE.test(date) && date < today;
}

export function isCurrentJob(job: Job, today = localTodayIso()) {
  if (['ended', 'shelved'].includes(job.status)) return false;
  // 已纳入个人流程的岗位不会因网申截止而消失：截止日只限制继续申请，
  // 不代表已投递、测评或面试记录已经结束。
  if (job.isInApplicationTracker || ['applied', 'test', 'interview'].includes(job.status)) return true;
  return !hasPassedDate(job.deadline, today);
}

export function isCurrentCalendarEvent(event: CalendarEvent, today = localTodayIso()) {
  return !hasPassedDate(event.date, today);
}

export function isCurrentInboxItem(item: InboxItem, today = localTodayIso()) {
  return !hasPassedDate(item.detectedDeadline, today);
}

export function isExpiredSourceLink(link: NonNullable<Job['sourceLinks']>[number]) {
  return EXPIRED_TEXT.test(`${link.title} ${link.status}`);
}
