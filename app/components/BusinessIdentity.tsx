import type { CmsSiteSettings } from "@/lib/cms-types";
import { resolveBusinessIdentity } from "@/lib/business-identity";

export default function BusinessIdentity({
  label = "Business details",
  settings,
}: {
  label?: string;
  settings: CmsSiteSettings | null;
}) {
  const identity = resolveBusinessIdentity(settings);
  if (!identity.hasDetails) return null;

  return (
    <div className="business-identity">
      <p className="business-identity-label">{label}</p>
      <dl>
        {identity.legalBusinessName && (
          <div>
            <dt>Business</dt>
            <dd>{identity.legalBusinessName}</dd>
          </div>
        )}
        {identity.businessId && (
          <div>
            <dt>Business ID</dt>
            <dd>{identity.businessId}</dd>
          </div>
        )}
        {identity.fullAddress && (
          <div>
            <dt>Address</dt>
            <dd className="business-identity-address">{identity.fullAddress}</dd>
          </div>
        )}
        {identity.publicContactEmail && (
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${identity.publicContactEmail}`}>
                {identity.publicContactEmail}
              </a>
            </dd>
          </div>
        )}
        {identity.publicPhone && (
          <div>
            <dt>Phone</dt>
            <dd>
              {identity.phoneHref ? (
                <a href={`tel:${identity.phoneHref}`}>{identity.publicPhone}</a>
              ) : identity.publicPhone}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
