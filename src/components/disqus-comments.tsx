
'use client';

import { DiscussionEmbed } from 'disqus-react';

interface DisqusCommentsProps {
    shortname: string;
    identifier: string;
    title: string;
}

export default function DisqusComments({ shortname, identifier, title }: DisqusCommentsProps) {
    const disqusConfig = {
        url: typeof window !== 'undefined' ? window.location.href : '',
        identifier: identifier,
        title: title,
    };

    return (
        <div>
            <DiscussionEmbed
                shortname={shortname}
                config={disqusConfig}
            />
        </div>
    );
}
