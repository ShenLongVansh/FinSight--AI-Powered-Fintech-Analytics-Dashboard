import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPasswordProfiles, savePasswordProfile, deletePasswordProfile } from '@/lib/supabase/client';
import { encrypt, decrypt } from '@/lib/utils/encryption';

// GET: Fetch all password profiles for the current user
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const profiles = await getPasswordProfiles(user.id);

        // Decrypt and transform to match frontend type
        const formattedProfiles = profiles.map(p => ({
            id: p.id,
            name: decrypt(p.name), // Decrypt the name
            encryptedPassword: decrypt(p.encrypted_password), // Decrypt the password
            createdAt: p.created_at,
        }));

        return NextResponse.json({ profiles: formattedProfiles });
    } catch (error) {
        console.error('Error fetching password profiles:', error);
        return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }
}

// POST: Save a new password profile
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, encryptedPassword } = await req.json();

        if (!name || !encryptedPassword) {
            return NextResponse.json({ error: 'Name and password required' }, { status: 400 });
        }

        // Encrypt both name and password before storing
        const profile = await savePasswordProfile(user.id, {
            name: encrypt(name),
            encrypted_password: encrypt(encryptedPassword),
        });

        if (!profile) {
            return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
        }

        // Return decrypted values for immediate use in frontend
        return NextResponse.json({
            success: true,
            profile: {
                id: profile.id,
                name: name, // Return original name for display
                encryptedPassword: encryptedPassword, // Return original password for immediate use
                createdAt: profile.created_at,
            }
        });
    } catch (error) {
        console.error('Error saving password profile:', error);
        return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }
}

// DELETE: Remove a password profile
export async function DELETE(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const profileId = searchParams.get('id');

        if (!profileId) {
            return NextResponse.json({ error: 'Profile ID required' }, { status: 400 });
        }

        const success = await deletePasswordProfile(user.id, profileId);

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting password profile:', error);
        return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }
}
