import { supabaseServer } from '../../../lib/supabaseServerClient';
import { validateEmail, validatePassword, validateMatricNo } from '../../../lib/validators';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      matricNo,
      department,
      course,
      phone
    } = req.body;

    if (!email || !password || !firstName || !lastName || !matricNo) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please use a valid TAU student email (@st.tau.edu.ng or @tau.edu.ng)' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, number and special character' });
    }

    if (!validateMatricNo(matricNo)) {
      return res.status(400).json({ error: 'Invalid matric number format' });
    }

    const { data: existingStudent } = await supabaseServer
      .from('students')
      .select('email, matric_no')
      .or(`email.eq.${email.toLowerCase()},matric_no.eq.${matricNo.toUpperCase()}`)
      .maybeSingle();

    if (existingStudent) {
      if (existingStudent.email === email.toLowerCase()) {
        return res.status(409).json({ error: 'This email is already registered. Please login instead.' });
      }
      if (existingStudent.matric_no === matricNo.toUpperCase()) {
        return res.status(409).json({ error: 'This matric number is already registered.' });
      }
    }

    const { data: authData, error: authError } = await supabaseServer.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          first_name: firstName,
          last_name: lastName,
          role: 'student'
        }
      }
    });

    if (authError) {
      console.error('Signup error:', authError);
      return res.status(400).json({ error: 'Registration failed. Please try again.' });
    }

    const { error: profileError } = await supabaseServer
      .from('students')
      .insert([{
        user_id: authData.user.id,
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        matric_no: matricNo.toUpperCase(),
        department: department || 'Computer Science',
        course: course || 'Computer Science',
        phone: phone || null,
        status: 'active',
        created_at: new Date().toISOString()
      }]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      await supabaseServer.auth.admin.deleteUser(authData.user.id).catch(() => null);
      return res.status(500).json({ error: 'Registration failed. Please contact support.' });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: { id: authData.user.id, email: authData.user.email },
      session: authData.session || null
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}
