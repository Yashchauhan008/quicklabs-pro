import { Fragment } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ROUTES } from '@/config';
import { useGetSubject } from '@/hooks/useSubjects';
import { useGetDocument } from '@/hooks/useDocuments';

const uuidSegment =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const segmentLabel: Record<string, string> = {
  dashboard: 'Overview',
  subject: 'Courses',
  document: 'Materials',
  profile: 'Profile',
  settings: 'Preferences',
  add: 'Upload',
  create: 'New course',
  edit: 'Edit',
  peers: 'Peers',
  enquiries: 'Get help',
  new: 'New enquiry',
  help: 'Get help',
  'super-desk': 'Super Desk',
};

type Crumb = { path: string; label: string };

/** Build crumbs under `/learn/...` without a redundant "Explore" step. */
function learnPathToCrumbs(parts: string[]): Crumb[] {
  if (parts.length === 0) return [];

  const out: Crumb[] = [];
  let i = 0;

  if (parts[0] === 'explore' && parts[1] === 'courses') {
    out.push({ path: '/learn/explore/courses', label: 'All courses' });
    i = 2;
  } else if (parts[0] === 'explore' && parts[1] === 'materials') {
    out.push({ path: '/learn/explore/materials', label: 'All materials' });
    i = 2;
  } else if (parts[0] === 'explore') {
    i = 1;
  }

  for (; i < parts.length; i++) {
    const path = `/learn/${parts.slice(0, i + 1).join('/')}`;
    const seg = parts[i];
    const prev = i > 0 ? parts[i - 1] : '';

    let label: string;
    if (uuidSegment.test(seg)) {
      label =
        prev === 'peers'
          ? 'Student profile'
          : prev === 'subject' || prev === 'document'
            ? 'Details'
            : 'Details';
    } else {
      label = segmentLabel[seg] ?? seg;
    }
    out.push({ path, label });
  }

  return out;
}

export const BreadcrumbNav = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const subjectDetailMatch = useMatch({
    path: '/learn/subject/:id',
    end: true,
  });
  const subjectEditMatch = useMatch({
    path: '/learn/subject/:id/edit',
    end: true,
  });
  const rawSubjectDetailId = subjectDetailMatch?.params.id;
  const rawSubjectEditId = subjectEditMatch?.params.id;
  const subjectBreadcrumbId =
    (rawSubjectDetailId && uuidSegment.test(rawSubjectDetailId)
      ? rawSubjectDetailId
      : undefined) ??
    (rawSubjectEditId && uuidSegment.test(rawSubjectEditId)
      ? rawSubjectEditId
      : undefined);
  const { data: breadcrumbSubject } = useGetSubject(subjectBreadcrumbId);

  const documentDetailMatch = useMatch({
    path: '/learn/document/:id',
    end: true,
  });
  const rawDocumentId = documentDetailMatch?.params.id;
  const documentBreadcrumbId =
    rawDocumentId && uuidSegment.test(rawDocumentId)
      ? rawDocumentId
      : undefined;
  const { data: breadcrumbDocument } = useGetDocument(documentBreadcrumbId);

  if (segments[0] === 'learn') {
    const parts = segments.slice(1);
    const crumbs = learnPathToCrumbs(parts);
    const subjectCrumbPath = subjectBreadcrumbId
      ? `/learn/subject/${subjectBreadcrumbId}`
      : null;
    const documentCrumbPath = documentBreadcrumbId
      ? `/learn/document/${documentBreadcrumbId}`
      : null;

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={ROUTES.DASHBOARD}>Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            const label =
              subjectCrumbPath &&
              crumb.path === subjectCrumbPath &&
              breadcrumbSubject?.name
                ? breadcrumbSubject.name
                : documentCrumbPath &&
                    crumb.path === documentCrumbPath &&
                    breadcrumbDocument?.title
                  ? breadcrumbDocument.title
                  : crumb.label;
            return (
              <Fragment key={crumb.path}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="max-w-[min(100%,14rem)] truncate md:max-w-xs">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={crumb.path}
                        className="max-w-[min(100%,14rem)] truncate md:max-w-xs"
                      >
                        {label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const crumbs = segments;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={ROUTES.DASHBOARD}>Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {crumbs.map((name, index) => {
          const routeTo = `/${crumbs.slice(0, index + 1).join('/')}`;
          const isLast = index === crumbs.length - 1;
          const breadcrumbName = uuidSegment.test(name)
            ? 'Details'
            : segmentLabel[name] || name;

          return (
            <Fragment key={routeTo}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{breadcrumbName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routeTo}>{breadcrumbName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
